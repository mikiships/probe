import { readFileSync } from "fs";
import yaml from "js-yaml";
import type { Scenario, ScenarioTurn, Expectation } from "./types.js";

/** Raw YAML structure for a scenario */
interface YamlScenario {
  id: string;
  name: string;
  category: string;
  description?: string;
  severity?: "critical" | "high" | "medium" | "low";
  systemPrompt?: string;
  turns: Array<{
    role: "user" | "system" | "assistant";
    content: string;
  }>;
  expect: Array<{
    type: string;
    values?: string[];
    pattern?: string;
    maxTokens?: number;
    description?: string;
  }>;
  tags?: string[];
}

/** Validate and convert a raw YAML scenario to a Scenario */
function validateYamlScenario(data: unknown): Scenario {
  const raw = data as YamlScenario;

  if (!raw.id || typeof raw.id !== "string") {
    throw new Error("Scenario missing required 'id' field");
  }
  if (!raw.name || typeof raw.name !== "string") {
    throw new Error(`Scenario ${raw.id} missing required 'name' field`);
  }
  if (!raw.category || typeof raw.category !== "string") {
    throw new Error(`Scenario ${raw.id} missing required 'category' field`);
  }
  if (!raw.turns || !Array.isArray(raw.turns) || raw.turns.length === 0) {
    throw new Error(
      `Scenario ${raw.id} missing required non-empty 'turns' array`
    );
  }
  if (!raw.expect || !Array.isArray(raw.expect) || raw.expect.length === 0) {
    throw new Error(
      `Scenario ${raw.id} missing required non-empty 'expect' array`
    );
  }

  // Validate turns
  for (let i = 0; i < raw.turns.length; i++) {
    const turn = raw.turns[i];
    if (!turn.role || !["user", "system", "assistant"].includes(turn.role)) {
      throw new Error(
        `Scenario ${raw.id} turn ${i} has invalid role (must be user/system/assistant)`
      );
    }
    if (!turn.content || typeof turn.content !== "string") {
      throw new Error(`Scenario ${raw.id} turn ${i} missing required 'content'`);
    }
  }

  // Validate expectations
  const validExpectationTypes = [
    "not_contains",
    "contains",
    "refusal",
    "compliance",
    "no_tool_call",
    "stays_in_character",
    "regex_not_match",
    "max_tokens",
  ];
  for (let i = 0; i < raw.expect.length; i++) {
    const exp = raw.expect[i];
    if (!exp.type || !validExpectationTypes.includes(exp.type)) {
      throw new Error(
        `Scenario ${raw.id} expectation ${i} has invalid type (must be one of ${validExpectationTypes.join(", ")})`
      );
    }
  }

  const turns: ScenarioTurn[] = raw.turns.map((t) => ({
    role: t.role,
    content: t.content,
  }));

  const expect: Expectation[] = raw.expect.map((e) => ({
    type: e.type as Expectation["type"],
    values: e.values,
    pattern: e.pattern,
    maxTokens: e.maxTokens,
    description: e.description,
  }));

  return {
    id: raw.id,
    name: raw.name,
    category: raw.category as any,
    description: raw.description,
    severity: raw.severity ?? "medium",
    systemPrompt: raw.systemPrompt,
    turns,
    expect,
    tags: raw.tags,
  };
}

/** Load scenarios from a YAML file */
export function loadScenariosFromYaml(filePath: string): Scenario[] {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = yaml.load(content);

    if (!data) {
      throw new Error("YAML file is empty");
    }

    // Handle both array format and single scenario format
    const scenarios = Array.isArray(data) ? data : [data];

    return scenarios.map((scenario, index) => {
      try {
        return validateYamlScenario(scenario);
      } catch (err) {
        throw new Error(`Error validating scenario at index ${index}: ${err}`);
      }
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to load YAML scenarios from ${filePath}: ${err.message}`);
    }
    throw err;
  }
}

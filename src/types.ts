/** A single conversation turn in a scenario */
export interface ScenarioTurn {
  role: "user" | "system" | "assistant";
  content: string;
}

/** Expected behavior assertion */
export interface Expectation {
  type:
    | "not_contains" // response must NOT contain these strings
    | "contains" // response must contain these strings
    | "refusal" // agent should refuse the request
    | "compliance" // agent should comply with the request
    | "no_tool_call" // agent should not invoke any tools
    | "stays_in_character" // agent maintains persona
    | "regex_not_match" // response must not match regex
    | "max_tokens"; // response should not exceed token count
  values?: string[];
  pattern?: string;
  maxTokens?: number;
  description?: string;
}

/** A single test scenario */
export interface Scenario {
  id: string;
  name: string;
  category: ScenarioCategory;
  description?: string;
  severity: "critical" | "high" | "medium" | "low";
  /** System prompt to set up context (optional, uses target's default if not set) */
  systemPrompt?: string;
  /** Conversation turns to execute */
  turns: ScenarioTurn[];
  /** What we expect from the final response */
  expect: Expectation[];
  /** Tags for filtering */
  tags?: string[];
}

export type ScenarioCategory =
  | "pii"
  | "injection"
  | "exfiltration"
  | "rules"
  | "routing"
  | "spend"
  | "persona";

/** Result of running a single scenario */
export interface ScenarioResult {
  scenario: Scenario;
  passed: boolean;
  response: string;
  failures: FailedExpectation[];
  durationMs: number;
  tokenCount?: number;
}

export interface FailedExpectation {
  expectation: Expectation;
  actual: string;
  reason: string;
}

/** Adapter interface for connecting to different agent types */
export interface AgentAdapter {
  name: string;
  /** Send a conversation and get a response */
  chat(messages: Array<{ role: string; content: string }>): Promise<string>;
  /** Optional: check if the agent invoked any tools */
  lastToolCalls?(): Array<{ name: string; args: unknown }>;
}

/** Configuration for a probe run */
export interface ProbeConfig {
  target: string;
  adapter?: string;
  scenarios: ScenarioCategory[] | "all";
  failUnder?: number;
  report?: "console" | "json" | "html";
  concurrency?: number;
  timeout?: number;
  verbose?: boolean;
  /** Enable LLM-based refusal judge for ambiguous cases */
  useRefusalJudge?: boolean;
  /** Confidence threshold for LLM refusal judge (0-1) */
  refusalJudgeThreshold?: number;
}

/** Overall run result */
export interface ProbeReport {
  target: string;
  timestamp: string;
  totalScenarios: number;
  passed: number;
  failed: number;
  score: number;
  durationMs: number;
  results: ScenarioResult[];
  categories: Record<
    ScenarioCategory,
    { total: number; passed: number; failed: number }
  >;
}

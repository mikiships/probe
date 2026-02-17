import type { Scenario, ScenarioCategory } from "../types.js";
import { piiScenarios } from "./pii.js";
import { injectionScenarios } from "./injection.js";
import { personaScenarios } from "./persona.js";
import { exfiltrationScenarios } from "./exfiltration.js";
import { routingScenarios } from "./routing.js";
import { spendScenarios } from "./spend.js";
import { rulesScenarios } from "./rules.js";

const allScenarios: Scenario[] = [
  ...piiScenarios,
  ...injectionScenarios,
  ...personaScenarios,
  ...exfiltrationScenarios,
  ...routingScenarios,
  ...spendScenarios,
  ...rulesScenarios,
];

export function getScenarios(
  categories: ScenarioCategory[] | "all",
): Scenario[] {
  if (categories === "all") {
    return allScenarios;
  }
  return allScenarios.filter((s) => categories.includes(s.category));
}

export function listCategories(): Array<{
  category: ScenarioCategory;
  count: number;
}> {
  const counts = new Map<ScenarioCategory, number>();
  for (const s of allScenarios) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, count]) => ({
    category,
    count,
  }));
}

export {
  piiScenarios,
  injectionScenarios,
  personaScenarios,
  exfiltrationScenarios,
  routingScenarios,
  spendScenarios,
  rulesScenarios,
};

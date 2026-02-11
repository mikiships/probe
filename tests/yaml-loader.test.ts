import { test } from "node:test";
import * as assert from "node:assert";
import { loadScenariosFromYaml } from "../src/yaml-loader.js";
import { writeFileSync, unlinkSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

test("loadScenariosFromYaml - loads single scenario", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "probe-test-"));
  const testFile = join(tmpDir, "test.yaml");

  const yaml = `
id: test-scenario
name: Test Scenario
category: pii
turns:
  - role: user
    content: Test message
expect:
  - type: refusal
`;

  writeFileSync(testFile, yaml);

  try {
    const scenarios = loadScenariosFromYaml(testFile);
    assert.strictEqual(scenarios.length, 1);
    assert.strictEqual(scenarios[0].id, "test-scenario");
    assert.strictEqual(scenarios[0].name, "Test Scenario");
    assert.strictEqual(scenarios[0].category, "pii");
    assert.strictEqual(scenarios[0].severity, "medium"); // default
    assert.strictEqual(scenarios[0].turns.length, 1);
    assert.strictEqual(scenarios[0].expect.length, 1);
  } finally {
    unlinkSync(testFile);
  }
});

test("loadScenariosFromYaml - loads multiple scenarios", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "probe-test-"));
  const testFile = join(tmpDir, "test.yaml");

  const yaml = `
- id: scenario-1
  name: First
  category: pii
  turns:
    - role: user
      content: Test 1
  expect:
    - type: refusal

- id: scenario-2
  name: Second
  category: injection
  severity: critical
  turns:
    - role: user
      content: Test 2
  expect:
    - type: not_contains
      values:
        - secret
`;

  writeFileSync(testFile, yaml);

  try {
    const scenarios = loadScenariosFromYaml(testFile);
    assert.strictEqual(scenarios.length, 2);
    assert.strictEqual(scenarios[0].id, "scenario-1");
    assert.strictEqual(scenarios[1].id, "scenario-2");
    assert.strictEqual(scenarios[1].severity, "critical");
  } finally {
    unlinkSync(testFile);
  }
});

test("loadScenariosFromYaml - validates required fields", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "probe-test-"));
  const testFile = join(tmpDir, "test.yaml");

  const yaml = `
id: test-scenario
name: Test
`;

  writeFileSync(testFile, yaml);

  try {
    assert.throws(
      () => loadScenariosFromYaml(testFile),
      /missing required 'category' field/
    );
  } finally {
    unlinkSync(testFile);
  }
});

test("loadScenariosFromYaml - validates turns array", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "probe-test-"));
  const testFile = join(tmpDir, "test.yaml");

  const yaml = `
id: test-scenario
name: Test
category: pii
turns: []
expect:
  - type: refusal
`;

  writeFileSync(testFile, yaml);

  try {
    assert.throws(
      () => loadScenariosFromYaml(testFile),
      /missing required non-empty 'turns' array/
    );
  } finally {
    unlinkSync(testFile);
  }
});

test("loadScenariosFromYaml - validates expectation types", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "probe-test-"));
  const testFile = join(tmpDir, "test.yaml");

  const yaml = `
id: test-scenario
name: Test
category: pii
turns:
  - role: user
    content: Test
expect:
  - type: invalid_type
`;

  writeFileSync(testFile, yaml);

  try {
    assert.throws(
      () => loadScenariosFromYaml(testFile),
      /invalid type/
    );
  } finally {
    unlinkSync(testFile);
  }
});

test("loadScenariosFromYaml - validates turn roles", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "probe-test-"));
  const testFile = join(tmpDir, "test.yaml");

  const yaml = `
id: test-scenario
name: Test
category: pii
turns:
  - role: invalid
    content: Test
expect:
  - type: refusal
`;

  writeFileSync(testFile, yaml);

  try {
    assert.throws(
      () => loadScenariosFromYaml(testFile),
      /invalid role/
    );
  } finally {
    unlinkSync(testFile);
  }
});

test("loadScenariosFromYaml - handles all expectation types", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "probe-test-"));
  const testFile = join(tmpDir, "test.yaml");

  const yaml = `
id: test-scenario
name: Test
category: pii
turns:
  - role: user
    content: Test
expect:
  - type: refusal
  - type: contains
    values: [a, b]
  - type: not_contains
    values: [x, y]
  - type: regex_not_match
    pattern: "\\\\d+"
  - type: max_tokens
    maxTokens: 100
  - type: compliance
  - type: no_tool_call
  - type: stays_in_character
`;

  writeFileSync(testFile, yaml);

  try {
    const scenarios = loadScenariosFromYaml(testFile);
    assert.strictEqual(scenarios.length, 1);
    assert.strictEqual(scenarios[0].expect.length, 8);
  } finally {
    unlinkSync(testFile);
  }
});

test("loadScenariosFromYaml - handles optional fields", () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "probe-test-"));
  const testFile = join(tmpDir, "test.yaml");

  const yaml = `
id: test-scenario
name: Test
category: pii
description: Test description
severity: critical
systemPrompt: You are a test
turns:
  - role: user
    content: Test
expect:
  - type: refusal
    description: Should refuse
tags:
  - test-tag
`;

  writeFileSync(testFile, yaml);

  try {
    const scenarios = loadScenariosFromYaml(testFile);
    const scenario = scenarios[0];
    assert.strictEqual(scenario.description, "Test description");
    assert.strictEqual(scenario.severity, "critical");
    assert.strictEqual(scenario.systemPrompt, "You are a test");
    assert.deepStrictEqual(scenario.tags, ["test-tag"]);
  } finally {
    unlinkSync(testFile);
  }
});

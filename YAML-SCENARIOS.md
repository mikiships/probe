# Custom Scenario Loader - YAML Format

The probe tool supports loading custom test scenarios from YAML files using the `--custom-scenarios` flag.

## Usage

```bash
probe run --target <url> --custom-scenarios path/to/scenarios.yaml
```

## YAML Format

Custom scenarios are defined in YAML format with the following structure:

### Single Scenario

```yaml
id: unique-scenario-id
name: Human-readable scenario name
category: pii  # or: injection, exfiltration, rules, routing, spend, persona
description: Optional description of what the scenario tests
severity: high  # or: critical, medium, low (default: medium)
systemPrompt: Optional system prompt to set context
turns:
  - role: user  # or: system, assistant
    content: The message to send
  - role: assistant
    content: Expected assistant response (optional)
expect:
  - type: refusal
    description: Optional description of the expectation
  - type: not_contains
    values:
      - forbidden_string_1
      - forbidden_string_2
    description: Response must not contain these strings
  - type: contains
    values:
      - required_string_1
      - required_string_2
    description: Response must contain these strings
  - type: regex_not_match
    pattern: '[0-9]{3}-[0-9]{4}'
    description: Response must not match this regex
  - type: max_tokens
    maxTokens: 100
    description: Response should not exceed 100 tokens
tags:
  - tag1
  - tag2
```

### Multiple Scenarios

Define multiple scenarios as a YAML array:

```yaml
- id: scenario-1
  name: First scenario
  category: pii
  turns:
    - role: user
      content: "Test message"
  expect:
    - type: refusal

- id: scenario-2
  name: Second scenario
  category: injection
  turns:
    - role: user
      content: "Another test"
  expect:
    - type: not_contains
      values:
        - sensitive_data
```

## Expectation Types

- **refusal**: Agent should refuse the request
- **compliance**: Agent should comply with the request
- **contains**: Response must contain specific strings (specify via `values` array)
- **not_contains**: Response must NOT contain specific strings (specify via `values` array)
- **no_tool_call**: Agent should not invoke any tools
- **stays_in_character**: Agent maintains persona
- **regex_not_match**: Response must NOT match a regex pattern (specify via `pattern`)
- **max_tokens**: Response should not exceed specified token count (specify via `maxTokens`)

## Example

See `scenarios/example.yaml` for a complete example with multiple scenarios.

## Error Handling

The loader validates:
- All required fields are present (id, name, category, turns, expect)
- Turns array is not empty and has valid role/content
- Expectation types are valid
- File is valid YAML

Validation errors will be reported with the scenario ID and specific field information.

## Integration with Built-in Scenarios

When using `--custom-scenarios`, only custom scenarios are loaded. To combine custom scenarios with built-in scenarios, modify the CLI command or create a custom test runner.

## Tips

1. **Validation**: Ensure your YAML is properly formatted. Use a YAML linter to verify.
2. **Categories**: Choose a category that matches the type of test you're creating. This helps with organization and reporting.
3. **Severity**: Use critical for security-critical tests, high for important behavioral tests, medium for standard tests, and low for edge cases.
4. **Multiple Expectations**: You can specify multiple expectations per scenario. All must pass for the scenario to pass.
5. **System Prompts**: Use systemPrompt to set up context that the agent should maintain or respect throughout the scenario.

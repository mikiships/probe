---
name: Scenario Suggestion
about: Suggest a new security scenario or test case
title: "[SCENARIO] "
labels: scenario
assignees: ''

---

## Failure Mode
What real-world security failure or vulnerability does this scenario test?

Describe the threat: How could an AI agent misuse data or break character under this attack?

## Scenario Description
What user inputs or system conditions would trigger this failure?

### Example Turns
Provide example conversation turns:

```yaml
- role: user
  content: "First message..."
- role: assistant
  content: "Expected response..."
- role: user
  content: "Adversarial follow-up..."
```

## What Should NOT Happen
What must the agent avoid doing?

Example:
- Not leak customer PII
- Not break character
- Not reroute requests to wrong recipient

## Why It Matters
Why is this scenario important to test? Any real-world incidents or production failures that motivated it?

## Category
Which category does this fit?
- [ ] PII Leakage
- [ ] Prompt Injection
- [ ] Data Exfiltration
- [ ] Message Routing
- [ ] Spend Control
- [ ] Persona Consistency
- [ ] Rule Compliance
- [ ] Other (describe)

## Additional Context
Links to related incidents, CVEs, papers, or discussions.

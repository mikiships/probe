# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-12

### Added
- **Core Framework**
  - Behavioral security testing framework for AI agents
  - 47 built-in test scenarios across 7 security categories
  - Concurrent test execution with configurable parallelism
  - LLM-based refusal judge for detecting evasive non-refusals

- **Test Categories**
  - PII Leakage (6 scenarios) – tests for user data exposure under social engineering
  - Prompt Injection (7 scenarios) – tests for system prompt override vulnerabilities
  - Data Exfiltration (8 scenarios) – tests for unauthorized data transmission
  - Rule Compliance (10 scenarios) – tests for consistent rule following
  - Routing Safety (6 scenarios) – tests for correct message recipient routing
  - Spend Control (5 scenarios) – tests for resistance to cost-inflating attacks
  - Persona Stability (5 scenarios) – tests for character stability under adversarial input

- **YAML Custom Scenarios**
  - Domain-specific test creation via `.yaml` files
  - Support for multi-turn conversations with custom assertions
  - Regex and containment-based validation rules
  - Custom refusal detection

- **Provider Support**
  - OpenAI API adapter
  - Anthropic API adapter
  - OpenAI-compatible endpoints (local, custom servers)
  - Generic HTTP POST adapter for custom agents

- **Reporting**
  - HTML report generation with interactive results
  - JSON output format for CI/CD integration
  - Console output with progress bars and severity indicators
  - Per-scenario failure reasons and agent responses

- **CLI**
  - `probe run` – execute tests against target agent
  - `--target` – specify agent endpoint
  - `--all` – run all 47 scenarios
  - `--category` – run specific test category
  - `--scenario` – run custom YAML scenario
  - `--concurrency` – control parallel execution (default: 3)
  - `--timeout` – per-scenario timeout in seconds (default: 30)
  - `--fail-under` – exit code 1 if score below threshold
  - `--report` – specify output format (console, html, json)

- **Documentation**
  - README with quick start and feature overview
  - YAML-SCENARIOS.md with full custom scenario syntax
  - CONTRIBUTING.md for bug reports and feature requests
  - CI integration example (.github/workflows)

- **Dependencies**
  - chalk – colored console output
  - commander – CLI argument parsing
  - js-yaml – YAML scenario parsing
  - ora – progress spinners
  - typescript – source language
  - tsx – development TypeScript runner

### Technical Details
- TypeScript source with full type safety
- Modular scenario system with pluggable judges
- Concurrent test execution without blocking
- Memory-efficient streaming report generation
- No external dependencies for core framework logic

### Known Limitations
- LLM judge uses model-specific refusal patterns (may have false positives/negatives)
- Custom HTTP adapter assumes JSON POST/response format
- Scenarios use synthetic data only (no real PII in examples)
- HTML reports open in browser automatically (configurable in future)

### Security Notes
- Designed for testing purposes against agents under your control
- Not intended for production scoring (use for pre-release testing)
- All test data is synthetic/fake
- Agent responses are logged for debugging (ensure compliance with privacy policies)

---

## [Unreleased]

### Planned for Future Releases
- Distributed scenario execution (parallel agents)
- Fuzzing integration for automated scenario generation
- False positive suppression per scenario
- Scenario versioning and community registry
- Grafana/Prometheus integration for continuous monitoring
- Support for multi-modal agent responses (images, audio)

---

**[0.1.0]**: Initial public release
- https://github.com/mikiships/probe/releases/tag/v0.1.0
- npm: https://www.npmjs.com/package/agent-probe

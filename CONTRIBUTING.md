# Contributing to Probe

Thanks for wanting to improve Probe! This document covers how to contribute.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/mikiships/probe.git
cd probe

# Install dependencies
npm install

# Start development
npm run dev

# Type check (run this before committing)
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Project Structure

```
src/
├── cli.ts              # Command-line interface
├── index.ts            # Main entry point
├── runner.ts           # Scenario execution engine
├── reporter.ts         # Report generation
├── scenarios/          # Scenario definitions
│   ├── index.ts        # Scenario registry
│   ├── pii.ts          # PII leakage tests
│   ├── injection.ts    # Prompt injection tests
│   ├── exfiltration.ts # Data exfiltration tests
│   ├── routing.ts      # Wrong-recipient tests
│   ├── spend.ts        # Spend control tests
│   ├── persona.ts      # Persona consistency tests
│   └── rules.ts        # Rule compliance tests
├── yaml-loader.ts      # YAML scenario loader
└── refusal-judge.ts    # LLM-based refusal detection
```

## Adding a New Scenario Pack

### 1. Create the scenario file

Create `src/scenarios/my-category.ts`:

```typescript
import { Scenario } from '../index.js';

export const myScenarios: Scenario[] = [
  {
    id: 'my-scenario-1',
    name: 'Example scenario',
    category: 'my-category',
    turns: [
      { role: 'user', content: 'First user message' },
      { role: 'assistant', content: 'Expected assistant response' },
      { role: 'user', content: 'Follow-up challenge' },
    ],
    expect: [
      {
        type: 'not_contains',
        values: ['secret', 'private'],
        description: 'Should not leak sensitive data',
      },
    ],
  },
  // Add more scenarios...
];
```

### 2. Register the pack

Update `src/scenarios/index.ts`:

```typescript
import { myScenarios } from './my-category.js';

export const scenarios = {
  // ... existing packs
  'my-category': myScenarios,
};
```

### 3. Test locally

```bash
npm run dev -- run --scenarios my-category --target http://localhost:3000/chat
```

### 4. Update BUILD-TASKS.md and commit

Add your scenario pack to the checklist, then:

```bash
git add src/scenarios/my-category.ts src/scenarios/index.ts
git commit -m "feat: add my-category scenario pack"
```

## Running Tests

```bash
# Run all tests
npm test

# Test a specific scenario pack
npm run dev -- run --scenarios pii --target http://localhost:3000/chat

# Generate a report
npm run dev -- run --scenarios all --target http://localhost:3000/chat --report html
```

## Code Style

- Use TypeScript with strict mode enabled
- Use `const` by default, `let` when needed
- Use async/await (avoid `.then()`)
- Format with Prettier (eslint-config includes Prettier)
- Keep functions focused and small
- Add JSDoc comments for public APIs

## Submitting Changes

1. **Fork and branch**: Create a feature branch from `main`
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**: Follow the code style above

3. **Test**: Run type check and tests
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Verify compilation**: 
   ```bash
   npx tsc --noEmit
   ```

5. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new feature

   Description of what this does and why."
   ```

6. **Push and open a PR**:
   ```bash
   git push origin feature/my-feature
   ```

7. **Wait for CI**: GitHub Actions will lint and type-check your code

## What We're Looking For

- **New scenario packs**: Real-world failure modes, edge cases
- **Better detection**: Improved refusal detection, better pass/fail logic
- **Documentation**: Clarify how to use Probe, add examples
- **Adapter support**: Support for new agent frameworks
- **Bug fixes**: Anything that's broken
- **Performance**: Faster scenario execution, better concurrency

## Reporting Issues

Found a bug or want to request a feature? Open an issue on GitHub:

1. **For bugs**: Include steps to reproduce, expected behavior, actual behavior
2. **For features**: Explain the use case and why you need it
3. **For scenario ideas**: Describe the real-world failure mode you want to test

## Questions?

This is early-stage software. If something is confusing or doesn't work, let us know. We'll improve the docs or code.

## License

By contributing, you agree that your code will be licensed under MIT, same as the project.

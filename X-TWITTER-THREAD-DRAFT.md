# X/Twitter Thread Draft – probe Launch

**⚠️ AWAITING JOSH APPROVAL BEFORE POSTING ⚠️**

---

## Thread Structure: "The AI Agent Testing Problem"

### Tweet 1 (Hook)
```
We've been red-teaming AI agents in production.

Traditional security scanning? Useless. Agents leak PII confidently. They break character on weak prompts. They route data to the wrong place and sound totally fine about it.

Behavioral failures don't show up in output benchmarks. So we built probe.

🧵
```

### Tweet 2 (The Problem)
```
Your agent passes every test and hits production Tuesday. Wednesday? It's on the news because:

1. User tricks it into leaking a password
2. Competitor's jailbreak escapes the system prompt
3. A misrouted API call sends data to the wrong customer
4. It broke character and started roleplaying the attacker's prompt

All of this passes traditional "does the output look right" checks.
```

### Tweet 3 (Solution)
```
probe runs 47 behavioral security tests before you ship:

🔴 PII Leakage (6 tests)
🔴 Prompt Injection (7 tests)
🔴 Data Exfiltration (8 tests)
🔴 Rule Compliance (10 tests)
🔴 Routing Safety (6 tests)
🔴 Spend Control (5 tests)
🔴 Persona Stability (5 tests)

Each one targets a real failure mode we've seen in production.
```

### Tweet 4 (How It Works)
```
Usage:

```bash
npm install -g agent-probe
probe run --target http://localhost:3000/chat --all
```

You get an HTML report showing:
- Which tests failed
- Why they failed
- Agent's actual responses
- Severity ratings

No setup. No training data. Run it before every release.
```

### Tweet 5 (Call to Action)
```
Open source, MIT licensed. Adapters for OpenAI, Anthropic, and any OpenAI-compatible endpoint.

GitHub: https://github.com/mikiships/probe

Built from real agent failures. If your agent is in production, you need this.

Feedback, bug reports, and scenario ideas welcome.
```

---

## Thread Metadata
- **Category:** Technical / AI Safety / DevTools
- **Hashtags to consider:** #AI #AgentSafety #DevTools #SecurityTesting #OpenSource
- **Mentions (optional):** @anthropics @openai (if appropriate, after Josh approval)
- **Media assets:** Could add 1-2 gifs or screenshots of HTML report if available

## Notes for Josh
- Thread emphasizes real production failures (credibility)
- No hype language ("revolutionary," "game-changing") — just facts
- Focus: teams that actually care about safety, not hype
- Tone: confident but not arrogant; technical but accessible
- Thread is ready for posting once approved

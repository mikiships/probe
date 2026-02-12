# Hacker News "Show HN" Post Draft

## Title
Show HN: probe – Behavioral security testing for AI agents (like Playwright, but for agent vulnerabilities)

## Description
We've been red-teaming AI agents in production and noticed that traditional security scanning and output benchmarks miss the real failures—behavioral ones. LLMs can sound confident while leaking PII, succumbing to prompt injection, or breaking character.

**probe** is a testing framework that catches this. It runs 47 built-in scenarios across 7 security categories:
- PII Leakage – does your agent leak user data under social engineering?
- Prompt Injection – can users override system instructions?
- Data Exfiltration – does your agent exfil data via tool calls or encoded text?
- Rule Compliance – does your agent follow its own rules consistently?
- Routing Safety – does your agent send messages to the right recipient?
- Spend Control – can users trick it into expensive operations?
- Persona Stability – does it break character under adversarial input?

It's designed for teams that actually care about agent safety before shipping to production.

Install: `npm install -g agent-probe`
Configure your agent endpoint, run `probe run --target $URL --all`, get an HTML report.

GitHub: https://github.com/mikiships/probe
Works with OpenAI, Anthropic, any OpenAI-compatible endpoint, or custom HTTP adapters.

Would love feedback on the scenarios, false positives, or new test ideas.

## URL
https://github.com/mikiships/probe

## Comments to Expect / Keywords
- Comparative questions: How does this compare to existing testing frameworks?
- Use cases: Do you have examples of real failures it's caught?
- Integration: Does it work with Claude API / OpenAI / etc.?
- False positives: Any known issues with the LLM judge?
- Licensing: MIT, so it's freely usable

## Posting Strategy
- Post on a Thursday (HN dislikes Monday/Tuesday launches slightly)
- Best time: 8–11 AM ET (peak HN traffic)
- Avoid Fridays if possible (people checking out early)
- Have a comment ready explaining the problem that spawned this (real agent failures)

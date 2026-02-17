import type { ProbeReport, ScenarioCategory } from "./types.js";

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  pii: "PII Leakage",
  injection: "Prompt Injection",
  exfiltration: "Data Exfiltration",
  rules: "Rule Compliance",
  routing: "Routing Safety",
  spend: "Spend Control",
  persona: "Persona Stability",
};

function progressBar(passed: number, total: number, width = 14): string {
  const filled = Math.round((passed / total) * width);
  const empty = width - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

export function formatConsoleReport(report: ProbeReport): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(`probe v0.1.0 -- agent behavioral testing`);
  lines.push("");
  lines.push(`Target: ${report.target}`);
  lines.push(
    `Scenarios: ${report.totalScenarios} tests across ${Object.keys(report.categories).length} categories`,
  );
  lines.push("");

  // Category breakdown
  const cats = Object.entries(report.categories) as Array<
    [ScenarioCategory, { total: number; passed: number; failed: number }]
  >;

  for (const [cat, stats] of cats) {
    const label = (CATEGORY_LABELS[cat] ?? cat).padEnd(20);
    const bar = progressBar(stats.passed, stats.total);
    const count = `${stats.passed}/${stats.total} passed`;
    const failNote = stats.failed > 0 ? ` (${stats.failed} FAIL)` : "";
    lines.push(`${label} ${bar} ${count}${failNote}`);
  }

  lines.push("");

  // Score summary
  lines.push(
    `Score: ${report.passed}/${report.totalScenarios} (${report.score}%) -- ${report.failed} failure${report.failed !== 1 ? "s" : ""} detected`,
  );
  lines.push(`Duration: ${(report.durationMs / 1000).toFixed(1)}s`);

  // Failed scenario details
  const failures = report.results.filter((r) => !r.passed);
  if (failures.length > 0) {
    lines.push("");
    lines.push(`--- Failures ---`);
    lines.push("");

    for (const fail of failures) {
      lines.push(
        `FAIL [${fail.scenario.severity}] ${fail.scenario.name} (${fail.scenario.id})`,
      );
      for (const f of fail.failures) {
        lines.push(`  Reason: ${f.reason}`);
        if (f.actual && f.actual.length < 200) {
          lines.push(`  Response: ${f.actual.slice(0, 200)}`);
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function formatJsonReport(report: ProbeReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatHtmlReport(report: ProbeReport): string {
  const scoreClass =
    report.score >= 90
      ? "score-pass"
      : report.score >= 70
        ? "score-warn"
        : "score-fail";

  // Build category rows
  const categoryRows = Object.entries(report.categories)
    .map(([cat, stats]) => {
      const label = CATEGORY_LABELS[cat as ScenarioCategory] ?? cat;
      const percentage = ((stats.passed / stats.total) * 100).toFixed(1);
      const bar = progressBar(stats.passed, stats.total, 20);
      return `
        <tr>
          <td>${label}</td>
          <td class="bar">${bar}</td>
          <td>${stats.passed}/${stats.total}</td>
          <td>${percentage}%</td>
        </tr>`;
    })
    .join("\n");

  // Build failure details
  const failures = report.results.filter((r) => !r.passed);
  const failureDetails = failures
    .map((fail) => {
      const failureReasons = fail.failures
        .map((f) => {
          let details = `<div class="reason">${escapeHtml(f.reason)}</div>`;
          if (f.actual && f.actual.length < 500) {
            details += `<div class="response">Response: ${escapeHtml(f.actual.slice(0, 200))}</div>`;
          }
          return details;
        })
        .join("\n");

      return `
        <div class="failure-item">
          <div class="failure-header">
            <span class="severity severity-${fail.scenario.severity}">${fail.scenario.severity.toUpperCase()}</span>
            <span class="name">${escapeHtml(fail.scenario.name)}</span>
            <span class="id">(${fail.scenario.id})</span>
          </div>
          ${failureReasons}
        </div>`;
    })
    .join("\n");

  const failureSection =
    failures.length > 0
      ? `
        <section class="failures">
          <h2>Test Failures (${failures.length})</h2>
          ${failureDetails}
        </section>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>probe Report - ${report.target}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #1e293b;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    
    header {
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      padding: 40px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    
    main {
      padding: 40px;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: #0f172a;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    
    .stat-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.7;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
    }
    
    .score {
      font-size: 48px;
      font-weight: 700;
    }
    
    .score-pass { color: #10b981; }
    .score-warn { color: #f59e0b; }
    .score-fail { color: #ef4444; }
    
    section {
      margin-bottom: 40px;
    }
    
    section h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      border-bottom: 2px solid #334155;
      padding-bottom: 10px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th {
      background: #0f172a;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #334155;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #334155;
    }
    
    tr:hover {
      background: rgba(59, 130, 246, 0.1);
    }
    
    .bar {
      font-family: monospace;
      font-size: 13px;
      letter-spacing: 0.05em;
    }
    
    .failures {
      margin-top: 40px;
    }
    
    .failure-item {
      background: #0f172a;
      border-left: 4px solid #ef4444;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 4px;
    }
    
    .failure-header {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .severity {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .severity-critical { background: #dc2626; }
    .severity-high { background: #ea580c; }
    .severity-medium { background: #f59e0b; }
    .severity-low { background: #3b82f6; }
    
    .name {
      flex: 1;
      color: #fca5a5;
    }
    
    .id {
      font-size: 12px;
      opacity: 0.7;
      font-family: monospace;
    }
    
    .reason {
      margin-top: 8px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      font-size: 13px;
    }
    
    .response {
      margin-top: 8px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      color: #cbd5e1;
      word-break: break-word;
    }
    
    footer {
      background: #0f172a;
      padding: 20px 40px;
      font-size: 12px;
      opacity: 0.7;
      border-top: 1px solid #334155;
    }
    
    .timestamp {
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title">🔴 probe Report</div>
      <div class="subtitle">Agent Behavioral Testing Report for ${escapeHtml(report.target)}</div>
    </header>
    
    <main>
      <div class="summary">
        <div class="stat-card">
          <div class="stat-label">Total Tests</div>
          <div class="stat-value">${report.totalScenarios}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Passed</div>
          <div class="stat-value" style="color: #10b981;">${report.passed}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Failed</div>
          <div class="stat-value" style="color: #ef4444;">${report.failed}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Duration</div>
          <div class="stat-value">${(report.durationMs / 1000).toFixed(1)}s</div>
        </div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%); margin-bottom: 40px;">
        <div class="stat-label">Overall Score</div>
        <div class="score ${scoreClass}">${report.score}%</div>
      </div>
      
      <section>
        <h2>Category Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Progress</th>
              <th>Passed</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRows}
          </tbody>
        </table>
      </section>
      
      ${failureSection}
    </main>
    
    <footer>
      <div>Report generated at <span class="timestamp">${new Date(report.timestamp).toLocaleString()}</span></div>
      <div>probe v0.1.0 — <a href="https://github.com/mikiships/probe" style="color: #3b82f6;">github.com/mikiships/probe</a></div>
    </footer>
  </div>
</body>
</html>`;

  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

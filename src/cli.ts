#!/usr/bin/env node
import { program } from "commander";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { OpenAIAdapter } from "./adapters/openai.js";
import { AnthropicAdapter } from "./adapters/anthropic.js";
import { getScenarios, listCategories } from "./scenarios/index.js";
import { loadScenariosFromYaml } from "./yaml-loader.js";
import { runProbe } from "./runner.js";
import { formatConsoleReport, formatJsonReport, formatHtmlReport } from "./reporter.js";
import type { AgentAdapter, ScenarioCategory } from "./types.js";

program
  .name("probe")
  .description("Red-team your AI agent before your users do")
  .version("0.1.0");

program
  .command("run")
  .description("Run behavioral tests against an agent")
  .requiredOption("--target <url>", "Agent endpoint URL")
  .option(
    "--adapter <type>",
    "Adapter type: openai, anthropic",
    "openai"
  )
  .option(
    "--scenarios <categories>",
    "Comma-separated categories or 'all'",
    "all"
  )
  .option("--custom-scenarios <path>", "Load custom scenarios from YAML file")
  .option("--api-key <key>", "API key for the target")
  .option("--model <model>", "Model to use")
  .option(
    "--fail-under <score>",
    "Exit with error if score below this %",
    "0"
  )
  .option("--report <format>", "Output format: console, json, html", "console")
  .option("--report-file <path>", "Output file path (for json/html formats)")
  .option("--timeout <ms>", "Timeout per scenario in milliseconds", "30000")
  .option("--concurrency <num>", "Number of concurrent scenarios to run", "1")
  .option("--verbose", "Show individual test results", false)
  .action(async (opts) => {
    let scenarios = [];

    // Load custom scenarios if provided
    if (opts.customScenarios) {
      try {
        scenarios = loadScenariosFromYaml(opts.customScenarios);
      } catch (err) {
        console.error(`Error loading custom scenarios: ${err}`);
        process.exit(1);
      }
    } else {
      // Load built-in scenarios
      const categories =
        opts.scenarios === "all"
          ? ("all" as const)
          : (opts.scenarios.split(",") as ScenarioCategory[]);

      scenarios = getScenarios(categories);
    }

    if (scenarios.length === 0) {
      console.error("No scenarios found for the specified categories.");
      process.exit(1);
    }

    // Create adapter
    let adapter: AgentAdapter;
    switch (opts.adapter) {
      case "anthropic":
        adapter = new AnthropicAdapter({
          apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY ?? "",
          model: opts.model,
        });
        break;
      case "openai":
      default:
        adapter = new OpenAIAdapter({
          baseUrl: opts.target,
          apiKey: opts.apiKey ?? process.env.OPENAI_API_KEY,
          model: opts.model,
        });
        break;
    }

    console.log(`\nprobe v0.1.0 -- running ${scenarios.length} scenarios...\n`);

    const report = await runProbe(scenarios, adapter, {
      verbose: opts.verbose,
      timeout: parseInt(opts.timeout, 10),
      concurrency: parseInt(opts.concurrency, 10),
    });

    // Generate report based on format
    let reportContent: string;
    let defaultFileName: string;

    switch (opts.report) {
      case "json":
        reportContent = formatJsonReport(report);
        defaultFileName = "probe-report.json";
        break;
      case "html":
        reportContent = formatHtmlReport(report);
        defaultFileName = "probe-report.html";
        break;
      case "console":
      default:
        reportContent = formatConsoleReport(report);
        defaultFileName = "";
        break;
    }

    // Output report
    if (opts.report === "console") {
      console.log(reportContent);
    } else {
      // For json/html, write to file or stdout
      const outputPath = opts.reportFile || defaultFileName;
      if (outputPath) {
        const filePath = resolve(outputPath);
        writeFileSync(filePath, reportContent);
        console.log(`Report written to ${filePath}`);
      } else {
        // Fallback to stdout if no file specified and format is not console
        console.log(reportContent);
      }
    }

    // Fail under threshold
    const failUnder = parseInt(opts.failUnder, 10);
    if (failUnder > 0 && report.score < failUnder) {
      console.error(
        `\nScore ${report.score}% is below threshold ${failUnder}%`
      );
      process.exit(1);
    }

    process.exit(report.failed > 0 ? 1 : 0);
  });

program
  .command("list")
  .description("List available scenario categories")
  .action(() => {
    console.log("\nAvailable scenario categories:\n");
    const cats = listCategories();
    for (const { category, count } of cats) {
      console.log(`  ${category.padEnd(15)} ${count} scenarios`);
    }
    console.log(
      `\n  Total: ${cats.reduce((sum, c) => sum + c.count, 0)} scenarios`
    );
    console.log("");
  });

program.parse();

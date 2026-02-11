import type { AgentAdapter } from "../types.js";

export interface OpenAIAdapterConfig {
  baseUrl: string;
  apiKey?: string;
  model?: string;
}

/**
 * Adapter for OpenAI-compatible chat completion endpoints.
 * Works with OpenAI, Anthropic (via proxy), local models, etc.
 */
export class OpenAIAdapter implements AgentAdapter {
  name = "openai-compatible";
  private config: OpenAIAdapterConfig;
  private _lastToolCalls: Array<{ name: string; args: unknown }> = [];

  constructor(config: OpenAIAdapterConfig) {
    this.config = config;
  }

  async chat(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    this._lastToolCalls = [];

    const url = this.config.baseUrl.endsWith("/v1/chat/completions")
      ? this.config.baseUrl
      : `${this.config.baseUrl.replace(/\/$/, "")}/v1/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.config.model ?? "gpt-4",
        messages,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Agent returned ${response.status}: ${text}`);
    }

    const data = (await response.json()) as {
      choices: Array<{
        message: {
          content: string | null;
          tool_calls?: Array<{
            function: { name: string; arguments: string };
          }>;
        };
      }>;
    };

    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error("No response from agent");
    }

    // Track tool calls if present
    if (choice.message.tool_calls) {
      this._lastToolCalls = choice.message.tool_calls.map((tc) => ({
        name: tc.function.name,
        args: JSON.parse(tc.function.arguments),
      }));
    }

    return choice.message.content ?? "";
  }

  lastToolCalls() {
    return this._lastToolCalls;
  }
}

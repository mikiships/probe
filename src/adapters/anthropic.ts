import type { AgentAdapter } from "../types.js";

export interface AnthropicAdapterConfig {
  baseUrl?: string;
  apiKey: string;
  model?: string;
}

/**
 * Adapter for Anthropic Messages API.
 */
export class AnthropicAdapter implements AgentAdapter {
  name = "anthropic";
  private config: AnthropicAdapterConfig;

  constructor(config: AnthropicAdapterConfig) {
    this.config = config;
  }

  async chat(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const baseUrl = this.config.baseUrl ?? "https://api.anthropic.com";
    const url = `${baseUrl.replace(/\/$/, "")}/v1/messages`;

    // Separate system message from conversation
    const systemMsg = messages.find((m) => m.role === "system");
    const conversationMsgs = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model ?? "claude-sonnet-4-20250514",
        max_tokens: 1024,
        ...(systemMsg ? { system: systemMsg.content } : {}),
        messages: conversationMsgs,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic returned ${response.status}: ${text}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const textBlock = data.content?.find((c) => c.type === "text");
    return textBlock?.text ?? "";
  }
}

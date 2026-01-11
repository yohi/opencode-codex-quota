import type { PluginInput } from "@opencode-ai/plugin";
import { fetchCodexUsage } from "../api/codex-client.js";
import { formatCompactQuotaStatus } from "../ui/compact-formatter.js";

interface ToolExecuteInput {
  tool: string;
  sessionID: string;
  callID: string;
}

interface ToolExecuteOutput {
  title: string;
  output: string;
  metadata: unknown;
}

export function createQuotaDisplayHook(client: PluginInput["client"]) {
  return async (
    input: ToolExecuteInput,
    _output: ToolExecuteOutput
  ): Promise<void> => {
    try {
      if (!client?.tui?.showToast) {
        return;
      }

      if (input.tool === "codex-status") {
        return;
      }

      const snapshot = await fetchCodexUsage();
      const formatted = formatCompactQuotaStatus(snapshot);

      client.tui.showToast({
        body: {
          message: formatted,
          variant: "info",
        },
      });
    } catch (error) {
      console.error("Failed to display Codex quota:", error);
      return;
    }
  };
}

import type { Plugin } from "@opencode-ai/plugin";
import { tool, type ToolContext } from "@opencode-ai/plugin/tool";
import { createQuotaDisplayHook } from "./hooks/quota-display.js";
import { fetchCodexUsage } from "./api/codex-client.js";
import { formatCompactQuotaStatus } from "./ui/compact-formatter.js";

type EmptyArgs = Record<string, never>;

const codexStatusTool = tool({
  description: "Show Codex quota status",
  args: {},
  execute: async (_args: EmptyArgs, _context: ToolContext) => {
    try {
      const snapshot = await fetchCodexUsage();
      return formatCompactQuotaStatus(snapshot);
    } catch (error) {
      console.error("Failed to retrieve Codex quota status", error);
      const errorDetail =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      return `Failed to retrieve Codex quota status${errorDetail}`;
    }
  },
});

const CodexQuotaPlugin: Plugin = async ({ client }) => {
  const quotaDisplay = createQuotaDisplayHook(client);

  return {
    "tool.execute.after": quotaDisplay,
    tool: {
      "codex-status": codexStatusTool,
    },
  };
};

export default CodexQuotaPlugin;

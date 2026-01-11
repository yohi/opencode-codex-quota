import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const CODEX_CLI_AUTH_PATH = join(homedir(), ".codex", "auth.json");

interface CodexCliAuthTokens {
  access_token?: string;
  account_id?: string;
  refresh_token?: string;
  id_token?: string;
}

interface CodexCliAuth {
  tokens?: CodexCliAuthTokens;
  OPENAI_API_KEY?: string;
  last_refresh?: string;
}

export interface CodexAuthInfo {
  accessToken: string;
  accountId?: string;
}

export async function loadCodexCliAuth(): Promise<CodexAuthInfo | null> {
  try {
    const content = await fs.readFile(CODEX_CLI_AUTH_PATH, "utf-8");
    const data = JSON.parse(content) as CodexCliAuth;

    if (!data.tokens?.access_token) {
      return null;
    }

    return {
      accessToken: data.tokens.access_token,
      accountId: data.tokens.account_id,
    };
  } catch {
    return null;
  }
}

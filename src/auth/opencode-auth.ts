import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const ACCOUNTS_FILE_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "antigravity-accounts.json"
);

interface AntigravityAccount {
  email: string;
  refreshToken: string;
  projectId: string;
  managedProjectId?: string;
  addedAt: number;
  lastUsed: number;
  rateLimitResetTimes: Record<string, number>;
}

interface AntigravityAccountsFile {
  version: number;
  accounts: AntigravityAccount[];
  activeIndex: number;
  activeIndexByFamily?: Record<string, number>;
}

export interface OpenCodeAuthInfo {
  refreshToken: string;
  email?: string;
  projectId?: string;
}

export async function loadOpenCodeAuth(): Promise<OpenCodeAuthInfo | null> {
  try {
    const content = await fs.readFile(ACCOUNTS_FILE_PATH, "utf-8");
    const data = JSON.parse(content) as AntigravityAccountsFile;

    if (!data.accounts || data.accounts.length === 0) {
      return null;
    }

    const activeIndex = Math.max(
      0,
      Math.min(data.activeIndex, data.accounts.length - 1)
    );
    const activeAccount = data.accounts[activeIndex];

    if (!activeAccount || !activeAccount.refreshToken) {
      return null;
    }

    return {
      refreshToken: activeAccount.refreshToken,
      email: activeAccount.email,
      projectId: activeAccount.projectId,
    };
  } catch {
    return null;
  }
}

import type {
  RateLimitSnapshot,
  RateLimitStatusPayload,
  RateLimitWindow,
  CreditsSnapshot,
} from "../core/types.js";
import { loadCodexCliAuth } from "../auth/codex-cli-auth.js";

const CHATGPT_API_BASE = "https://chatgpt.com/backend-api";
const CODEX_API_BASE = "https://api.openai.com";

export class CodexAuthExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CodexAuthExpiredError";
  }
}

interface CodexApiErrorPayload {
  error?: {
    code?: string | null;
    message?: string | null;
  };
  status?: number | null;
}

export function isCodexAuthExpiredError(error: unknown): boolean {
  return error instanceof CodexAuthExpiredError;
}

export async function fetchCodexUsage(
  baseUrl: string = CHATGPT_API_BASE,
  accessToken?: string,
  accountId?: string
): Promise<RateLimitSnapshot> {
  let token = accessToken;
  let accId = accountId;

  if (!token) {
    const cliAuth = await loadCodexCliAuth();
    if (!cliAuth) {
      throw new Error(
        "No access token available. Please authenticate with: codex auth login"
      );
    }
    token = cliAuth.accessToken;
    accId = cliAuth.accountId;
  }

  const endpoint = baseUrl.includes("chatgpt.com")
    ? `${baseUrl}/wham/usage`
    : `${baseUrl}/api/codex/usage`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "User-Agent": "OpenCode-Codex-Plugin/0.1.0",
  };

  if (accId && baseUrl.includes("chatgpt.com")) {
    headers["ChatGPT-Account-Id"] = accId;
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const parsed = parseCodexErrorPayload(errorText);
    const errorCode = parsed?.error?.code ?? null;

    if (response.status === 401 && errorCode === "token_expired") {
      throw new CodexAuthExpiredError(
        "Codex認証トークンの有効期限が切れています。`codex auth login` を実行してください。"
      );
    }

    throw new Error(
      `Failed to fetch Codex usage: ${response.status} - ${errorText}`
    );
  }

  const payload = (await response.json()) as RateLimitStatusPayload;
  return transformPayloadToSnapshot(payload);
}

function transformPayloadToSnapshot(
  payload: RateLimitStatusPayload
): RateLimitSnapshot {
  const primary = payload.rate_limit?.primary_window
    ? transformWindow(payload.rate_limit.primary_window)
    : null;

  const secondary = payload.rate_limit?.secondary_window
    ? transformWindow(payload.rate_limit.secondary_window)
    : null;

  const credits: CreditsSnapshot | null = payload.credits
    ? {
        hasCredits: payload.credits.has_credits,
        unlimited: payload.credits.unlimited,
        balance: payload.credits.balance || null,
      }
    : null;

  return {
    primary,
    secondary,
    credits,
    planType: payload.plan_type || null,
  };
}

function parseCodexErrorPayload(errorText: string): CodexApiErrorPayload | null {
  if (!errorText) {
    return null;
  }

  try {
    const parsed = JSON.parse(errorText) as CodexApiErrorPayload;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse Codex error payload", error);
  }

  return null;
}

function transformWindow(
  window: NonNullable<
    NonNullable<RateLimitStatusPayload["rate_limit"]>["primary_window"]
  >
): RateLimitWindow {
  const resetsAt = window.reset_at || null;
  const windowMinutes = window.limit_window_seconds
    ? Math.floor(window.limit_window_seconds / 60)
    : null;

  return {
    usedPercent: window.used_percent,
    windowMinutes,
    resetsAt,
  };
}

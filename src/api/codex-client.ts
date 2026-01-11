import type {
  RateLimitSnapshot,
  RateLimitStatusPayload,
  RateLimitWindow,
  CreditsSnapshot,
} from "../core/types.js";
import { loadCodexCliAuth } from "../auth/codex-cli-auth.js";

const CHATGPT_API_BASE = "https://chatgpt.com/backend-api";
const CODEX_API_BASE = "https://api.openai.com";

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

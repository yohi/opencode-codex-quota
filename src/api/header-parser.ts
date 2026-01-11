import type { RateLimitSnapshot, RateLimitWindow, CreditsSnapshot } from "../core/types.js";

export function parseRateLimitHeaders(headers: Record<string, string>): RateLimitSnapshot {
  const primary = parseRateLimitWindow(
    headers,
    "x-codex-primary-used-percent",
    "x-codex-primary-window-minutes",
    "x-codex-primary-reset-at"
  );

  const secondary = parseRateLimitWindow(
    headers,
    "x-codex-secondary-used-percent",
    "x-codex-secondary-window-minutes",
    "x-codex-secondary-reset-at"
  );

  const credits = parseCreditsSnapshot(headers);

  return {
    primary,
    secondary,
    credits,
    planType: null,
  };
}

function parseRateLimitWindow(
  headers: Record<string, string>,
  usedPercentHeader: string,
  windowMinutesHeader: string,
  resetsAtHeader: string
): RateLimitWindow | null {
  const usedPercent = parseFloat(headers[usedPercentHeader] || "");
  
  if (Number.isNaN(usedPercent)) {
    return null;
  }

  const windowMinutes = parseInt(headers[windowMinutesHeader] || "", 10);
  const resetsAt = parseInt(headers[resetsAtHeader] || "", 10);

  const hasData = 
    usedPercent !== 0 ||
    (!Number.isNaN(windowMinutes) && windowMinutes !== 0) ||
    !Number.isNaN(resetsAt);

  if (!hasData) {
    return null;
  }

  return {
    usedPercent,
    windowMinutes: Number.isNaN(windowMinutes) ? null : windowMinutes,
    resetsAt: Number.isNaN(resetsAt) ? null : resetsAt,
  };
}

function parseCreditsSnapshot(headers: Record<string, string>): CreditsSnapshot | null {
  const hasCredits = parseBool(headers["x-codex-credits-has-credits"]);
  const unlimited = parseBool(headers["x-codex-credits-unlimited"]);
  
  if (hasCredits === null || unlimited === null) {
    return null;
  }

  const balance = headers["x-codex-credits-balance"] || null;

  return {
    hasCredits,
    unlimited,
    balance: balance && balance.trim() !== "" ? balance : null,
  };
}

function parseBool(value: string | undefined): boolean | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === "true" || lower === "1") return true;
  if (lower === "false" || lower === "0") return false;
  return null;
}

import type { RateLimitSnapshot, RateLimitWindow } from "../core/types.js";
import { formatResetTimestamp } from "./time-formatter.js";

export function formatCompactQuotaStatus(snapshot: RateLimitSnapshot): string {
  const parts: string[] = ["[Codex]"];

  if (snapshot.primary) {
    parts.push(`Primary  : ${formatWindow(snapshot.primary)}`);
  }

  if (snapshot.secondary) {
    parts.push(`Secondary: ${formatWindow(snapshot.secondary)}`);
  }

  if (snapshot.credits) {
    if (snapshot.credits.unlimited) {
      parts.push("Credits  : Unlimited");
    } else if (snapshot.credits.balance) {
      parts.push(`Credits  : ${snapshot.credits.balance}`);
    }
  }

  return parts.join("\n");
}

function formatWindow(window: RateLimitWindow): string {
  const percentage = Math.round(Math.max(0, 100 - window.usedPercent));
  const percentDisplay = formatPercentage(percentage);

  const resetDisplay = window.resetsAt
    ? `(↻${formatResetTimestamp(window.resetsAt)})`
    : "";

  return `${percentDisplay}${resetDisplay}`;
}

function formatPercentage(value: number): string {
  const clamped = Math.min(100, Math.max(0, value));
  const paddedPercentage = String(clamped).padStart(3);

  if (clamped <= 0) {
    return `🪫  0%`;
  }

  if (clamped <= 20) {
    return `${paddedPercentage}%⚠️`;
  }

  return `${paddedPercentage}%🔋`;
}

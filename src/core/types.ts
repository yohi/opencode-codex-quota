// Codex Rate Limit types based on openai/codex protocol
// Reference: codex-rs/protocol/src/protocol.rs

export interface RateLimitSnapshot {
  primary: RateLimitWindow | null;
  secondary: RateLimitWindow | null;
  credits: CreditsSnapshot | null;
  planType: PlanType | null;
}

export interface RateLimitWindow {
  /** Percentage (0-100) of the window that has been consumed */
  usedPercent: number;
  /** Rolling window duration, in minutes */
  windowMinutes: number | null;
  /** Unix timestamp (seconds since epoch) when the window resets */
  resetsAt: number | null;
}

export interface CreditsSnapshot {
  hasCredits: boolean;
  unlimited: boolean;
  balance: string | null;
}

export type PlanType = "free" | "plus" | "pro" | "team" | "enterprise";

export type LimitType = "primary" | "secondary";

export interface CodexQuotaInfo {
  type: LimitType;
  usedPercent: number;
  resetTime?: Date;
  timeUntilResetMs?: number;
  windowMinutes?: number;
}

export interface RateLimitWindowSnapshot {
  used_percent: number;
  limit_window_seconds?: number;
  reset_after_seconds?: number;
  reset_at?: number;
}

export interface CreditStatusDetails {
  has_credits: boolean;
  unlimited: boolean;
  balance?: string;
}

export interface RateLimitStatusPayload {
  rate_limit?: {
    primary_window?: RateLimitWindowSnapshot;
    secondary_window?: RateLimitWindowSnapshot;
  };
  credits?: CreditStatusDetails;
  plan_type?: PlanType;
}

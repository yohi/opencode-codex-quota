export function formatResetTimestamp(resetsAtSeconds: number): string {
  const now = Date.now();
  const resetMs = resetsAtSeconds * 1000;
  const diffMs = Math.max(0, resetMs - now);

  if (diffMs <= 0) {
    return "now";
  }

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }
  
  if (minutes > 0) {
    return `in ${minutes}m`;
  }
  
  return "soon";
}

// Sanitize nickname for safe filename usage
export function sanitizeNickname(nickname: string): string {
  return nickname.replace(/[^a-zA-Z0-9-_]/g, "_");
}


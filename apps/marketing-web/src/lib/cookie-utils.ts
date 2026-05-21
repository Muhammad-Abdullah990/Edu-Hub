export function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.split("=", 2)[1] ?? "");
}

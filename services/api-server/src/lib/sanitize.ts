const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (blockedKeys.has(key)) {
        continue;
      }

      sanitized[key] = sanitizeValue(nestedValue);
    }

    return sanitized;
  }

  return value;
}

export function sanitizeInput<T>(value: T): T {
  return sanitizeValue(value) as T;
}

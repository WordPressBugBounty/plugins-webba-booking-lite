import { AssistanceAction } from "./types";

function repairDoubledQuoteJson(input: string): string {
  if (!input.includes('""')) {
    return input;
  }

  return input.replace(/""([^"]*?)""/g, '"$1"');
}

function tryParseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }

    const repaired = repairDoubledQuoteJson(input);
    if (repaired === input) {
      throw error;
    }

    return JSON.parse(repaired);
  }
}

function unwrapJsonString(value: unknown): unknown {
  let current = value;

  while (typeof current === "string") {
    const trimmed = current.trim();
    if (trimmed === "") {
      return [];
    }

    current = tryParseJson(trimmed);
  }

  return current;
}

export function normalizeAssistanceActions(raw: unknown): AssistanceAction[] {
  const unwrapped = unwrapJsonString(raw);

  if (Array.isArray(unwrapped)) {
    if (unwrapped.every((item) => typeof item === "string")) {
      return unwrapped.flatMap((item) => normalizeAssistanceActions(item));
    }

    return unwrapped as AssistanceAction[];
  }

  if (unwrapped && typeof unwrapped === "object") {
    const record = unwrapped as Record<string, unknown>;
    if (Array.isArray(record.actions)) {
      return normalizeAssistanceActions(record.actions);
    }
  }

  return [];
}

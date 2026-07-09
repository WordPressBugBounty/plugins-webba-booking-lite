export const normalizeAssistanceSummaryText = (text: string): string =>
  text.replace(/\u2014/g, "-").replace(/\u2013/g, "-");

export const normalizeAssistanceSummaryLines = (lines: string[]): string[] =>
  lines.map(normalizeAssistanceSummaryText);

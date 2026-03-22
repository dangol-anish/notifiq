export function truncateWords(text?: string, maxLength: number = 10): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

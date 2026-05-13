/**
 * Extract the last segment of a slash-delimited path.
 * e.g. "prototypes/my-prototype" → "my-prototype"
 */
export function getPrototypeName(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}

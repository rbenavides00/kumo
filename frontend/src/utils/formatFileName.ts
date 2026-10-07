export function formatFileName(name: string, extension: string): string {
  return extension ? `${name}.${extension}` : name;
}

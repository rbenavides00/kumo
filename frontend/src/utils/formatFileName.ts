export function formatFileName(name: string, extension: string) {
  return extension ? `${name}.${extension}` : name;
}

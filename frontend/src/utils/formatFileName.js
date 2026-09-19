export function formatFileName(name, extension) {
  return extension ? `${name}.${extension}` : name;
}

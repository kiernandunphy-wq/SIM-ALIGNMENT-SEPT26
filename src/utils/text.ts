export function formatCourseCode(code?: string): string {
  if (!code || !code.trim()) return "";
  const trimmed = code.trim();
  // Match patterns like "RCP 203", "RCP203", "RCP-203", "RT 222", "RT222", "RT-222"
  const match = trimmed.match(/^([A-Za-z]{2,4})[\s-_]*(\d{3}[A-Za-z]?)$/);
  if (match) {
    return `${match[1].toUpperCase()}-${match[2]}`;
  }
  return trimmed;
}

export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function countTermOverlap(left: string[], right: string[]): number {
  const normalizedRight = right.map(normalizeText).filter(Boolean);
  return left
    .map(normalizeText)
    .filter(Boolean)
    .filter((term) =>
      normalizedRight.some(
        (candidate) =>
          candidate.includes(term) ||
          term.includes(candidate) ||
          term.split(" ").some((piece) => piece.length > 3 && candidate.includes(piece)),
      ),
    ).length;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

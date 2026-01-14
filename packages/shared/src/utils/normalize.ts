/**
 * Normalize a string for comparison and storage.
 */
export function normalizeString(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Normalize an email address.
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Normalize a URL by removing trailing slashes and common variations.
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove www. prefix for consistency
    parsed.hostname = parsed.hostname.replace(/^www\./, "");
    // Remove trailing slash
    let normalized = parsed.toString();
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    // If URL is invalid, return as-is
    return url.trim();
  }
}

/**
 * Extract domain from a URL.
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Normalize organization name for matching.
 */
export function normalizeOrgName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\b(gmbh|ag|inc|ltd|llc|e\.?v\.?|e\.?g\.?)\b/gi, "")
    .trim();
}

/**
 * Normalize job title for comparison.
 */
export function normalizeJobTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\(m\/w\/d\)/gi, "")
    .replace(/\(m\/f\/d\)/gi, "")
    .replace(/\(all genders\)/gi, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

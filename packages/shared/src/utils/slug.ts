/**
 * Generate a URL-safe slug from a string.
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    // Replace German umlauts
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // Remove accents from other characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-word characters except hyphens
    .replace(/[^\w-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/--+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a unique slug by appending a suffix if needed.
 */
export function generateUniqueSlug(
  input: string,
  existingSlugs: string[] | Set<string>,
): string {
  const baseSlug = generateSlug(input)
  const slugSet = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs)

  if (!slugSet.has(baseSlug)) {
    return baseSlug
  }

  // Append a number suffix
  let counter = 2
  let uniqueSlug = `${baseSlug}-${counter}`

  while (slugSet.has(uniqueSlug)) {
    counter++
    uniqueSlug = `${baseSlug}-${counter}`
  }

  return uniqueSlug
}

/**
 * Generate a job slug from title and organization.
 */
export function generateJobSlug(title: string, organizationName: string): string {
  const combined = `${title}-${organizationName}`
  return generateSlug(combined)
}

/**
 * Generate an organization slug from name.
 */
export function generateOrgSlug(name: string): string {
  return generateSlug(name)
}

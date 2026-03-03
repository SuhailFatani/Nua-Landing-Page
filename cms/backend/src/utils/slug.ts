export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // remove special characters
    .replace(/[\s_-]+/g, '-')   // replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '')    // remove leading/trailing hyphens
    .slice(0, 100)               // cap length
}

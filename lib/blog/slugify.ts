/**
 * Generate URL-friendly slug from title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate unique slug by checking existing slugs and adding number if needed
 */
export async function generateUniqueSlug(
  title: string, 
  userId: string,
  checkExists: (slug: string, userId: string) => Promise<boolean>
): Promise<string> {
  let slug = slugify(title);
  let counter = 1;
  
  while (await checkExists(slug, userId)) {
    slug = `${slugify(title)}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Generate username from email
 */
export function usernameFromEmail(email: string): string {
  const username = email.split('@')[0];
  return slugify(username);
}

/**
 * Generate unique username by checking existing usernames
 */
export async function generateUniqueUsername(
  email: string,
  checkExists: (username: string) => Promise<boolean>
): Promise<string> {
  let username = usernameFromEmail(email);
  let counter = 1;
  
  while (await checkExists(username)) {
    username = `${usernameFromEmail(email)}${counter}`;
    counter++;
  }
  
  return username;
}

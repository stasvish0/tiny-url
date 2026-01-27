import { z } from 'zod';

export const urlSchema = z.string().url('Please enter a valid URL');

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(/^[a-zA-Z0-9-]+$/, 'Only letters, numbers, and hyphens allowed');

export function validateUrl(url: string): { valid: boolean; error?: string } {
  const result = urlSchema.safeParse(url);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, error: result.error.issues[0]?.message };
}

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  const result = slugSchema.safeParse(slug);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, error: result.error.issues[0]?.message };
}

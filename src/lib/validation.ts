import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(32, 'Username cannot exceed 32 characters.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only use letters, numbers, underscores, and hyphens.'),
  fullName: z.string().trim().min(2, 'Please enter your name.').max(80),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password is too long.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
});

export const passwordResetSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.'),
});

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens allowed.'),
  fullName: z.string().trim().min(1, 'Name cannot be empty.').max(80),
  bio: z.string().trim().max(300, 'Bio cannot exceed 300 characters.'),
  learningGoal: z.string().trim().min(3, 'Share a short learning goal.').max(160),
  dailyGoalMinutes: z.number().int().min(5).max(480),
  preferredPace: z.enum(['slow', 'standard', 'accelerated']),
});

export const workspaceSaveSchema = z.object({
  title: z.string().trim().min(1, 'Workspace title is required.').max(80),
  htmlCode: z.string().max(100000),
  cssCode: z.string().max(100000),
  jsCode: z.string().max(100000),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(120),
  body: z.string().trim().min(5, 'Announcement body is required.').max(1000),
  published: z.boolean(),
});

export function isSafeHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

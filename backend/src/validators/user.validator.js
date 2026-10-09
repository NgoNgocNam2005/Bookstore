import { z } from 'zod';

const emptyObject = z.object({}).passthrough();

export const updateProfileSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(1).max(150).optional(),
      phone: z.string().trim().max(30).nullable().optional(),
      avatarUrl: z.string().url().max(500).nullable().optional()
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required'
    }),
  params: emptyObject,
  query: emptyObject
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
      confirmPassword: z.string().min(8)
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }),
  params: emptyObject,
  query: emptyObject
});

export const listUsersSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object({
    search: z.string().trim().max(255).optional(),
    role: z.enum(['admin', 'editor', 'staff', 'user']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
  }).passthrough()
});

export const userIdSchema = z.object({
  body: emptyObject,
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: emptyObject
});

export const adminUpdateUserSchema = z.object({
  body: z
    .object({
      role: z.enum(['admin', 'editor', 'staff', 'user']).optional(),
      status: z.enum(['active', 'inactive']).optional()
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required'
    }),
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: emptyObject
});


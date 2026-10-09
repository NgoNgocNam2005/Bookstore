import { z } from 'zod';

const emptyObject = z.object({}).passthrough();
const categoryParams = z.object({
  id: z.coerce.number().int().positive()
});

export const listCategoriesSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object({
    status: z.enum(['active', 'inactive']).optional(),
    search: z.string().trim().max(150).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
  }).passthrough()
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(5000).nullable().optional()
  }).strict(),
  params: emptyObject,
  query: emptyObject
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    status: z.enum(['active', 'inactive']).optional()
  }).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required'
  }),
  params: categoryParams,
  query: emptyObject
});

export const categoryIdSchema = z.object({
  body: emptyObject,
  params: categoryParams,
  query: emptyObject
});

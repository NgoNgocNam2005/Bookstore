import { z } from 'zod';

const emptyObject = z.object({}).passthrough();
const bookParams = z.object({
  id: z.coerce.number().int().positive()
});

const bookBody = {
  categoryId: z.coerce.number().int().positive(),
  title: z.string().trim().min(1).max(255),
  author: z.string().trim().max(180).nullable().optional(),
  isbn: z.string().trim().max(20).nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  coverUrl: z.string().url().max(500).nullable().optional(),
  publishedYear: z.coerce.number().int().min(0).max(3000).nullable().optional(),
  status: z.enum(['draft', 'active', 'inactive']).optional()
};

export const listBooksSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object({
    categoryId: z.coerce.number().int().positive().optional(),
    search: z.string().trim().max(255).optional(),
    status: z.enum(['draft', 'active', 'inactive']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
  }).passthrough()
});

export const createBookSchema = z.object({
  body: z.object(bookBody).strict(),
  params: emptyObject,
  query: emptyObject
});

export const updateBookSchema = z.object({
  body: z.object({
    ...bookBody,
    categoryId: bookBody.categoryId.optional(),
    title: bookBody.title.optional()
  }).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required'
  }),
  params: bookParams,
  query: emptyObject
});

export const bookIdSchema = z.object({
  body: emptyObject,
  params: bookParams,
  query: emptyObject
});

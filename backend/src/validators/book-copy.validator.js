import { z } from 'zod';

const emptyObject = z.object({}).passthrough();

const copyParams = z.object({
  id: z.coerce.number().int().positive()
});

export const listBookCopiesSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object({
    bookId: z.coerce.number().int().positive().optional(),
    status: z.enum([
      'available',
      'reserved',
      'borrowed',
      'lost',
      'damaged'
    ]).optional(),
    search: z.string().trim().max(255).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional()
  }).passthrough()
});

export const bookCopyIdSchema = z.object({
  body: emptyObject,
  params: copyParams,
  query: emptyObject
});

export const createBookCopySchema = z.object({
  body: z.object({
    bookId: z.coerce.number().int().positive(),
    copyCode: z.string().trim().min(1).max(100)
  }).strict(),
  params: emptyObject,
  query: emptyObject
});

export const updateBookCopyStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'available',
      'lost',
      'damaged'
    ])
  }).strict(),
  params: copyParams,
  query: emptyObject
});
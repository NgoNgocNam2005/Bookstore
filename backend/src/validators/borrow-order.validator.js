import { z } from 'zod';

const emptyObject = z.object({}).passthrough();
const orderParams = z.object({
  id: z.coerce.number().int().positive()
});
const paginationQuery = {
  search: z.string().trim().max(255).optional(),
  status: z.enum([
    'pending',
    'approved',
    'borrowed',
    'returned',
    'rejected',
    'cancelled'
  ]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
};

export const listMyBorrowOrdersSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object(paginationQuery).passthrough()
});

export const listBorrowOrdersSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object(paginationQuery).passthrough()
});

export const createBorrowOrderSchema = z.object({
  body: z.object({
    bookIds: z.array(z.coerce.number().int().positive()).min(1).max(20),
    note: z.string().trim().max(2000).nullable().optional()
  }).strict(),
  params: emptyObject,
  query: emptyObject
});

export const borrowOrderIdSchema = z.object({
  body: emptyObject,
  params: orderParams,
  query: emptyObject
});

export const updateBorrowOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'approved',
      'borrowed',
      'returned',
      'rejected',
      'cancelled'
    ]),
    adminNote: z.string().trim().max(2000).nullable().optional(),
    dueAt: z.string().datetime({ offset: true }).nullable().optional()
  }).strict(),
  params: orderParams,
  query: emptyObject
});

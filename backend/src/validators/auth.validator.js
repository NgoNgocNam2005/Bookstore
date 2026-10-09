import { z } from 'zod';

const emptyObject = z.object({}).passthrough();

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(1),
    password: z.string().min(1)
  }),
  params: emptyObject,
  query: emptyObject
});

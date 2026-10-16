import {z} from 'zod';


const emptyObject = z.object({}).passthrough();

const passwordSchema = z.string()
  .min(15, 'Password must be at least 15 characters')
  .refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'Password must not exceed 72 UTF-8 bytes'
  );

  export const createUserInvitationSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(255),
    username: z.string().trim().min(3).max(100).optional(),
    fullName: z.string().trim().min(1).max(150),
    phone: z.string().trim().max(30).nullable().optional()
  }).strict(),
  params: emptyObject,
  query: emptyObject
});


export const activateAccountSchema = z.object({
  body: z.object({
    token: z.string().length(43).regex(/^[A-Za-z0-9_-]+$/),
    password: passwordSchema,
    confirmPassword: passwordSchema
  }).strict().refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }
  ),
  params: emptyObject,
  query: emptyObject
});


export const resendInvitationSchema = z.object({
  body: emptyObject,
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  query: emptyObject
});
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Za-z]/, 'Password must include at least one letter.')
  .regex(/\d/, 'Password must include at least one number.');

export const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name is required.'),
    lastName: z.string().trim().min(2, 'Last name is required.'),
    email: z.string().trim().email('Enter a valid email address.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    acceptedTerms: z.boolean().refine((value) => value, 'You need to accept the Terms and Conditions to continue.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const { z } = require('zod');

const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable(),
  deadline: z.coerce.date().optional().nullable(),
});

const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  deadline: z.coerce.date().optional().nullable(),
});

const addMemberSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  uuidParamSchema,
};

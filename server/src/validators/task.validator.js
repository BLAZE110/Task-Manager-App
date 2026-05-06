const { z } = require('zod');

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .min(1, 'Task title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable(),
  assigneeIds: z
    .array(z.string().uuid('Invalid assignee ID'))
    .optional()
    .nullable(),
  tags: z.array(z.string()).default([]),
  estimatedHours: z.number().positive().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable(),
  assigneeIds: z
    .array(z.string().uuid('Invalid assignee ID'))
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional(),
  estimatedHours: z.number().positive().optional().nullable(),
});

const taskFilterSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assignees: z.string().optional(), // We'll keep it as a string for search query parameters (e.g., assignee=uuid) or change it later.
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const commentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must not exceed 1000 characters')
    .trim(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskFilterSchema,
  commentSchema,
};

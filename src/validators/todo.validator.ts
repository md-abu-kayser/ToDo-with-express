import Joi from 'joi';

export const createTodoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium')
    .messages({
      'any.only': 'Priority must be either low, medium, or high',
    }),
  dueDate: Joi.date().greater('now').optional().messages({
    'date.greater': 'Due date must be in the future',
  }),
  tags: Joi.array()
    .items(Joi.string().trim().max(20))
    .max(10)
    .default([])
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 20 characters',
    }),
});

export const updateTodoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title cannot exceed 100 characters',
  }),
  description: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
    'any.only': 'Priority must be either low, medium, or high',
  }),
  isCompleted: Joi.boolean().optional(),
  dueDate: Joi.date().greater('now').optional().allow(null).messages({
    'date.greater': 'Due date must be in the future',
  }),
  tags: Joi.array()
    .items(Joi.string().trim().max(20))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 20 characters',
    }),
}).min(1);

export const todoQuerySchema = Joi.object({
  isCompleted: Joi.boolean().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  tags: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),
  search: Joi.string().trim().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid('title', 'priority', 'dueDate', 'createdAt', 'updatedAt')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const todoIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid todo ID format',
    'string.length': 'Todo ID must be 24 characters long',
    'any.required': 'Todo ID is required',
  }),
});

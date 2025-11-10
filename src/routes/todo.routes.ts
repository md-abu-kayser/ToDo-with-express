import { Router } from 'express';
import todoController from '../controllers/todo.controller';
import asyncHandler from '../middlewares/asyncHandler';
import {
  validate,
  validateQuery,
  validateParams,
} from '../middlewares/validate.middleware';
import {
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema,
  todoIdSchema,
} from '../validators/todo.validator';

const router = Router();

/**
 * @route GET /api/todos/health
 * @description Health check endpoint
 * @access Public
 */
router.get('/health', asyncHandler(todoController.healthCheck));

/**
 * @route GET /api/todos/stats
 * @description Get todo statistics
 * @access Public
 */
router.get('/stats', asyncHandler(todoController.getTodoStats));

/**
 * @route GET /api/todos
 * @description Get all todos with filtering, pagination, and sorting
 * @access Public
 */
router.get(
  '/',
  validateQuery(todoQuerySchema),
  asyncHandler(todoController.getAllTodos)
);

/**
 * @route GET /api/todos/:id
 * @description Get a single todo by ID
 * @access Public
 */
router.get(
  '/:id',
  validateParams(todoIdSchema),
  asyncHandler(todoController.getTodoById)
);

/**
 * @route POST /api/todos
 * @description Create a new todo
 * @access Public
 */
router.post(
  '/',
  validate(createTodoSchema),
  asyncHandler(todoController.createTodo)
);

/**
 * @route PUT /api/todos/:id
 * @description Update a todo by ID
 * @access Public
 */
router.put(
  '/:id',
  validateParams(todoIdSchema),
  validate(updateTodoSchema),
  asyncHandler(todoController.updateTodo)
);

/**
 * @route DELETE /api/todos/:id
 * @description Delete a todo by ID
 * @access Public
 */
router.delete(
  '/:id',
  validateParams(todoIdSchema),
  asyncHandler(todoController.deleteTodo)
);

export default router;

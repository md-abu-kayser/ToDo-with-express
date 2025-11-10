import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import todoService, { TodoQuery } from '../services/todo.service';
import logger from '../utils/logger';

export class TodoController {
  async getAllTodos(req: Request, res: Response): Promise<void> {
    try {
      const query: TodoQuery = req.query;
      const result = await todoService.getAllTodos(query);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Todos fetched successfully',
        data: result.todos,
        pagination: {
          page: result.page,
          limit: Number(query.limit) || 10,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Error in getAllTodos controller:', error);
      throw error;
    }
  }

  async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Todo ID is required',
        });
        return;
      }

      const todo = await todoService.getTodoById(id);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Todo fetched successfully',
        data: todo,
      });
    } catch (error) {
      logger.error('Error in getTodoById controller:', error);
      throw error;
    }
  }

  async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const todo = await todoService.createTodo(req.body);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Todo created successfully',
        data: todo,
      });
    } catch (error) {
      logger.error('Error in createTodo controller:', error);
      throw error;
    }
  }

  async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Todo ID is required',
        });
        return;
      }

      const todo = await todoService.updateTodo(id, req.body);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Todo updated successfully',
        data: todo,
      });
    } catch (error) {
      logger.error('Error in updateTodo controller:', error);
      throw error;
    }
  }

  async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Todo ID is required',
        });
        return;
      }

      await todoService.deleteTodo(id);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Todo deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteTodo controller:', error);
      throw error;
    }
  }

  async getTodoStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await todoService.getTodoStats();

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Todo statistics fetched successfully',
        data: stats,
      });
    } catch (error) {
      logger.error('Error in getTodoStats controller:', error);
      throw error;
    }
  }

  async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      await todoService.getAllTodos({ limit: 1 });

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Service is unhealthy',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new TodoController();

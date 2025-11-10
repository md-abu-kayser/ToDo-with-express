import { ObjectId } from 'mongodb';
import Todo, { ITodo } from '../models/todo.model';
import logger from '../utils/logger';

export interface CreateTodoData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
  dueDate?: Date;
  tags?: string[];
}

export interface TodoQuery {
  isCompleted?: boolean;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TodoService {
  async getAllTodos(query: TodoQuery = {}): Promise<{
    todos: ITodo[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        isCompleted,
        priority,
        tags,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const filter: any = {};

      if (isCompleted !== undefined) {
        filter.isCompleted = isCompleted;
      }

      if (priority) {
        filter.priority = priority;
      }

      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;
      const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [todos, total] = await Promise.all([
        Todo.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        Todo.countDocuments(filter),
      ]);

      return {
        todos,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching todos:', error);
      throw new Error('Failed to fetch todos');
    }
  }

  async getTodoById(id: string): Promise<ITodo> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid todo ID');
      }

      const todo = await Todo.findById(id);

      if (!todo) {
        throw new Error('Todo not found');
      }

      return todo;
    } catch (error) {
      logger.error(`Error fetching todo ${id}:`, error);
      throw error;
    }
  }

  async createTodo(data: CreateTodoData): Promise<ITodo> {
    try {
      const todo = new Todo(data);
      const savedTodo = await todo.save();

      logger.info(`Todo created successfully: ${savedTodo._id}`);
      return savedTodo;
    } catch (error) {
      logger.error('Error creating todo:', error);
      throw new Error('Failed to create todo');
    }
  }

  async updateTodo(id: string, data: UpdateTodoData): Promise<ITodo> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid todo ID');
      }

      const todo = await Todo.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!todo) {
        throw new Error('Todo not found');
      }

      logger.info(`Todo updated successfully: ${id}`);
      return todo;
    } catch (error) {
      logger.error(`Error updating todo ${id}:`, error);
      throw error;
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid todo ID');
      }

      const todo = await Todo.findByIdAndDelete(id);

      if (!todo) {
        throw new Error('Todo not found');
      }

      logger.info(`Todo deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Error deleting todo ${id}:`, error);
      throw error;
    }
  }

  async getTodoStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    byPriority: { low: number; medium: number; high: number };
  }> {
    try {
      const [total, completed, byPriority] = await Promise.all([
        Todo.countDocuments(),
        Todo.countDocuments({ isCompleted: true }),
        Todo.aggregate([
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const priorityStats = { low: 0, medium: 0, high: 0 };
      byPriority.forEach((stat: any) => {
        priorityStats[stat._id as keyof typeof priorityStats] = stat.count;
      });

      return {
        total,
        completed,
        pending: total - completed,
        byPriority: priorityStats,
      };
    } catch (error) {
      logger.error('Error fetching todo stats:', error);
      throw new Error('Failed to fetch todo statistics');
    }
  }
}

export default new TodoService();

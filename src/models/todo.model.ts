import mongoose, { Document, Schema } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the return type for toJSON transform
interface TodoJSON {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be either low, medium, or high',
      },
      default: 'medium',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (this: any, value: Date) {
          return !value || value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, 'Tag cannot exceed 20 characters'],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any): TodoJSON {
        return {
          id: ret._id.toString(),
          title: ret.title,
          description: ret.description,
          priority: ret.priority,
          isCompleted: ret.isCompleted,
          dueDate: ret.dueDate,
          tags: ret.tags,
          createdAt: ret.createdAt,
          updatedAt: ret.updatedAt,
        };
      },
    },
  }
);

// Index for better query performance
todoSchema.index({ isCompleted: 1, dueDate: 1 });
todoSchema.index({ tags: 1 });
todoSchema.index({ createdAt: -1 });

export default mongoose.model<ITodo>('Todo', todoSchema);

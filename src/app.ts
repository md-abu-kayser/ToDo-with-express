import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';

import todoRoutes from './routes/todo.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import logger from './utils/logger'; // Fixed import path

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security headers
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Response compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing middleware with limits
    this.app.use(
      express.json({
        limit: '10mb',
        strict: true,
      })
    );
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: '10mb',
        parameterLimit: 100,
      })
    );

    // HTTP request logging
    this.app.use(
      morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      })
    );

    // Custom request logging middleware
    this.app.use((req, _res, next) => {
      logger.http('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });
      next();
    });

    // Security middleware - Remove X-Powered-By header
    this.app.disable('x-powered-by');
  }

  private initializeRoutes(): void {
    // API Documentation endpoint
    this.app.get('/api/docs', (_req, res) => {
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'API Documentation',
        endpoints: {
          health: 'GET /health',
          todos: {
            getAll: 'GET /api/todos',
            getSingle: 'GET /api/todos/:id',
            create: 'POST /api/todos',
            update: 'PUT /api/todos/:id',
            delete: 'DELETE /api/todos/:id',
            stats: 'GET /api/todos/stats',
          },
        },
        version: '1.0.0',
      });
    });

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      const healthCheck = {
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
      };

      logger.info('Health check performed', healthCheck);
      res.status(StatusCodes.OK).json(healthCheck);
    });

    // API routes
    this.app.use('/api/todos', todoRoutes);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.status(StatusCodes.OK).json({
        success: true,
        message: '🚀 Welcome to Production Ready Todo API',
        description:
          'A world-class RESTful API built with Express.js and TypeScript',
        version: '1.0.0',
        documentation: '/api/docs',
        healthCheck: '/health',
        endpoints: {
          todos: '/api/todos',
        },
        timestamp: new Date().toISOString(),
      });
    });

    // API welcome endpoint
    this.app.get('/api', (_req, res) => {
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Todo API Server',
        version: '1.0.0',
        status: 'operational',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeErrorHandling(): void {
    // Handle 404 - Route not found
    this.app.use(notFoundHandler);

    // Handle all other errors
    this.app.use(errorHandler);
  }

  // Method to get Express app instance (useful for testing)
  public getApp(): Application {
    return this.app;
  }
}

export default App;

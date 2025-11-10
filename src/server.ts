import 'dotenv/config';
import { connectDatabase } from './config/database';
import App from './app';
import logger from './utils/logger';

class Server {
  private app: App;
  private port: number;

  constructor() {
    this.app = new App();
    this.port = parseInt(process.env.PORT || '5000');
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Start server
      const server = this.app.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
      });

      // Graceful Shutdown
      this.setupGracefulShutdown(server);
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(server: any): void {
    const signals = ['SIGTERM', 'SIGINT'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);

        server.close((err: any) => {
          if (err) {
            logger.error('Error during server close:', err);
            process.exit(1);
          }

          logger.info('Server closed successfully');
          process.exit(0);
        });

        // Force Close After 10 Seconds
        setTimeout(() => {
          logger.error('Forced shutdown after timeout');
          process.exit(1);
        }, 10000);
      });
    });

    // Handle Unhandled Rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }
}

// Start The Server
// --------------------------->
const server = new Server();
server.start();

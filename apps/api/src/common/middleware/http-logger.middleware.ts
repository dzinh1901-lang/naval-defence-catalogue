import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'nestjs-pino';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const ms = Date.now() - start;
      const logFn = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
      this.logger[logFn]({
        method,
        url: originalUrl,
        statusCode,
        responseTimeMs: ms,
      });
    });

    next();
  }
}

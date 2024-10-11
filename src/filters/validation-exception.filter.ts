import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();
    // Combine the default message and the Laravel-like errors object
    const formattedErrors = this.formatErrors(exceptionResponse?.message || []);
    // Return combined response with 'statusCode', 'error', and custom 'errors'
    response.status(status).json({
      statusCode: status,
      message: exceptionResponse.error,
      errors: formattedErrors,
    });
  }

  private formatErrors(errors: string[]) {
    const result = {};
    errors.forEach((error) => {
      const parts = error.split(' ');
      const field = parts[0]?.toLowerCase();
      const message = error;
      if (!result[field]) {
        result[field] = [];
      }
      result[field].push(message);
    });
    return result;
  }
}

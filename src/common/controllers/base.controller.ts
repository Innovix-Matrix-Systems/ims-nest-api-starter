import { Res } from '@nestjs/common';
import { Response } from 'express';

export class BaseController {
  sendPaginatedResponse(
    data: any[],
    pageData: PaginatedMeta,
    message = '',
    statusCode = 200,
    res: Response,
  ) {
    const response = {
      data,
      success: true,
      message,
      statusCode,
      meta: {
        currentPage: pageData.currentPage,
        from: pageData.from,
        lastPage: pageData.lastPage,
        // links: pageData.links || [],
        path: pageData.path || '',
        perPage: pageData.perPage,
        to: pageData.to,
        total: pageData.total,
      },
    };

    return res.status(statusCode).json(response);
  }
  sendSuccessResponse(
    result: any,
    message = '',
    statusCode = 200,
    @Res() res: Response,
  ) {
    const response = {
      success: true,
      statusCode,
      message,
      data: result,
    };

    return res.status(statusCode).json(response);
  }

  sendErrorResponse(
    error: string,
    errorMessages = [],
    statusCode = 500,
    @Res() res: Response,
  ) {
    if (errorMessages.length === 0) {
      errorMessages = [error];
    }
    const response = {
      success: false,
      statusCode,
      message: error,
      errors: errorMessages,
    };

    return res.status(statusCode).json(response);
  }
}

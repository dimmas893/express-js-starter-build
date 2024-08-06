import { Response } from 'express';
import { ResponseCode, getMessage } from './responseCode';

interface PaginatedResponse {
  response_code: string;
  response_message: string;
  items: any[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

class ResponseHelper {
  static generate(
    res: Response,
    response_code: ResponseCode,
    data: any = {},
    message?: string
  ): Response {
    const statusCode = parseInt(response_code.slice(0, 3), 10);
    const response_message = message || getMessage(response_code);

    return res.status(statusCode).json({
      response_code,
      response_message,
      ...data,
    });
  }

  static paginate(
    res: Response,
    items: any[],
    currentPage: number,
    lastPage: number,
    perPage: number,
    total: number,
    response_code: ResponseCode = '200000',
    message?: string
  ): Response {
    const response_message = message || getMessage(response_code);

    const response: PaginatedResponse = {
      response_code,
      response_message,
      items,
      currentPage,
      lastPage,
      perPage,
      total,
    };

    return res.status(parseInt(response_code.slice(0, 3), 10)).json(response);
  }
}

export default ResponseHelper;

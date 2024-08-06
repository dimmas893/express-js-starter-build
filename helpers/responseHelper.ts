import { Response } from 'express';
import { ResponseCode, getMessage } from './responseCode';

interface PaginatedResponse {
  responseCode: string;
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
    responseCode: ResponseCode = '200000',
    message?: string
  ): Response {
    const response_message = message || getMessage(responseCode);

    const response: PaginatedResponse = {
      responseCode: responseCode,
      response_message: response_message,
      items: items,
      currentPage: currentPage,
      lastPage: lastPage,
      perPage: perPage,
      total: total,
    };

    return res.status(parseInt(responseCode.slice(0, 3), 10)).json(response);
  }
}

export default ResponseHelper;

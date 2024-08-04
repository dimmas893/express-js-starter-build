import { Response } from 'express';
import {
  ResponseCode,
  getMessage,
} from './responseCode';

interface ErrorResponse {
  responseCode: string;
  responseMessage: string;
  error?: string;
  data?: any;
}

interface SuccessResponse {
  responseCode: string;
  responseMessage: string;
  data?: any;
}

const generateErrorResponse = (res: Response, code: ResponseCode, err: string, data?: any) => {
  const response: ErrorResponse = {
    responseCode: code,
    responseMessage: getMessage(code),
    error: err,
    data: data,
  };

  const statusCode = parseInt(code.slice(0, 3), 10);
  res.status(statusCode).json(response);
};

const generateSuccessResponse = (res: Response, code: ResponseCode, data: any) => {
  const response: SuccessResponse = {
    responseCode: code,
    responseMessage: getMessage(code),
    data: data,
  };

  const statusCode = parseInt(code.slice(0, 3), 10);
  res.status(statusCode).json(response);
};

export {
  generateErrorResponse,
  generateSuccessResponse,
};

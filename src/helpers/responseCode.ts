// Define the ResponseCode type and constants
type ResponseCode = '200000' | '401000' | '400001' | '400002' | '500000';

const OK: ResponseCode = '200000';
const UNAUTHORIZED: ResponseCode = '401000';
const INVALID_FIELD_FORMAT: ResponseCode = '400001';
const LOGIN_FAILED: ResponseCode = '400002';
const SERVER_GENERAL_ERROR: ResponseCode = '500000';

const responseMessages: { [key in ResponseCode]: string } = {
  '200000': 'OK',
  '401000': 'Unauthorized',
  '400001': 'Invalid field format',
  '400002': 'Username or password is incorrect',
  '500000': 'General error',
};

const getMessage = (code: ResponseCode): string => {
  return responseMessages[code] || 'Unknown error code';
};

export {
  ResponseCode,
  OK,
  UNAUTHORIZED,
  INVALID_FIELD_FORMAT,
  LOGIN_FAILED,
  SERVER_GENERAL_ERROR,
  getMessage,
};

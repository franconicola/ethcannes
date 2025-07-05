// Error creation helper
export function createError(message, statusCode = 500, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) {
    error.code = code;
  }
  return error;
} 
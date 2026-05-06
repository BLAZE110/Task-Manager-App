const { sendError } = require('../utils/response');

/**
 * Global error handler middleware
 * Catches all errors thrown in routes/controllers and returns structured JSON
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Prisma-specific errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists.`;
    errors = [{ field, message }];
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found.';
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', {
      message: err.message,
      statusCode,
      stack: err.stack,
    });
  }

  // Never expose stack traces in production
  return sendError(res, message, statusCode, errors);
};

module.exports = errorHandler;

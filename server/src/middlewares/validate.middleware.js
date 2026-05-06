const AppError = require('../utils/AppError');

/**
 * Zod validation middleware factory
 * Validates req.body, req.query, or req.params against a Zod schema
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        throw new AppError('Validation failed', 400, errors);
      }

      // Replace source data with parsed (and transformed) data
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;

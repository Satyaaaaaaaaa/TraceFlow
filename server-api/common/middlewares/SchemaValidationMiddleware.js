const Ajv = require('ajv').default; //If you don't use .default when requiring the ajv module, you'll get an object that contains all the exports from the ajv module, not just the default export.
AJV_OPTS = {allErrors: true};

module.exports = {
    /**
   * @description Compiles the schema provided in argument and validates the data for the
   * compiled schema, and returns errors if any
   *
   * @param {Object} schema - AJV Schema to validate against
   *
   * @returns {Function} - Express request handler
   */
    verify: (schema) => {
        if(!schema) {
            throw new Error('Schema is required');
        }
        console.log('SchemaValidationMiddleware.verify');
        return (req, res, next) => {
            const ajv = new Ajv(AJV_OPTS);
            console.log(req.body)
            const validate = ajv.compile(schema);
            const valid = validate(req.body);

            if(valid) {
                return next();
            }

            return res.status(400).json({
                status: false,
                error: validate.errors
            });
        }
    }
}
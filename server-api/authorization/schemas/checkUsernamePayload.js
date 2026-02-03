// JSON Schema For Check Username Payload Validation

module.exports = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
            minLength: 3,
            maxLength: 20
        }
    },
    required: ['username'],
    additionalProperties: false
};
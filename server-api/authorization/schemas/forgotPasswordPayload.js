// JSON Schema For Forgot Password Payload Validation

module.exports = {
    type: 'object',
    properties: {
        newPassword:{
            type: 'string',
            minLength: 6,
            maxLength: 50
        },

        newConfirmPassword:{
            type: 'string',
            minLength: 6,
            maxLength: 50
        }
    },
    required: [
        'newPassword',
        'newConfirmPassword'
    ],
    additionalProperties: false
};
// JSON Schema For Forgot Password Payload Validation

module.exports = {
    type: 'object',
    properties: {

        username:{
            type:'string',
        },

        otp:{
            type:'string',
        },

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
        'username',
        'otp',
        'newPassword',
        'newConfirmPassword'
    ],
    additionalProperties: false
};
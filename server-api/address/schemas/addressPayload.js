module.exports = {
    type: 'object',
    properties: {   
        name: {
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        phoneNumber: {
            type: 'string',
            pattern: '^[0-9]{10}$'
        },
        pincode: {
            type: 'string',
            pattern: '^[0-9]{6}$'
        },
        branch: {
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        district: {
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        city: {
            type: 'string',
            minLength: 3,
            maxLength: 100
        },
        state: {
            type: 'string',
            minLength: 4,
            maxLength: 100
        },
        locality: {
            type: 'string',
            maxLength: 200
        },
        buildingName: {
            type: 'string',
            maxLength: 200
        },
        landmark: {
            type: 'string',
            maxLength: 200
        },
        isDefault: {
            type: 'boolean'
        },
        addressType: {
            type: 'string',
            maxLength: 100
        },
        weekendDelivery: {
            type: 'object',
            properties: {
                saturday: { type: ['boolean', 'null'] },
                sunday:   { type: ['boolean', 'null'] }
            },
            additionalProperties: false
        },
        deliveryInstructions: {
            type: 'string',
            maxLength: 1000
        }
    },
    required: [
        'name', 
        'phoneNumber', 
        'pincode', 
        'branch', 
        'district', 
        'city', 
        'state', 
        'locality', 
        'buildingName'
    ],

    additionalProperties: false
};
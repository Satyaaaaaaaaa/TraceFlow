const { productPriceUnits }  = require("../../config");
const DataTypes = require("sequelize");

module.exports = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 3,
      maxLength: 50
    },
    description: {
      type: "string",
      minLength: 5,
      maxLength: 255
    },
    // images: {
    //   type: "array",
    //   minItems: 1,
    //   items: {
    //     type: "string",
    //   }
    // },
    image_uuids: {
      type: "array",
      items: {
        type: "string",
      },
    },
    price: {
      type: "number",
      minimum: 1
    },
    priceUnit: {
      type: "string",
      enum: Object.values(productPriceUnits),
    },
    categoryIds: {
      type: "array",
      items: {
        type: "number",
      },
    },
    quantity: {
      type: "integer",     
      minimum: 1,
      maximum:100           
    },
    specifications: {
      type: 'object',
      additionalProperties: true  
    }
  },
  required: ["name", "description", "price", "categoryIds", "image_uuids", "priceUnit", ],
  additionalProperties: false
};

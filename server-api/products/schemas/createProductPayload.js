const { productPriceUnits }  = require("../../config");

module.exports = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    // images: {
    //   type: "array",
    //   minItems: 1,
    //   items: {
    //     type: "string",
    //   }
    // },
    price: {
      type: "number",
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
    image_uuids: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["name", "description", "price", "categoryIds"],
  additionalProperties: false,
};

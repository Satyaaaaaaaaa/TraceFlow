const { productPriceUnits } = require("../../config");
module.exports = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    image: {
      type: "string",
    },
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
    }
  },
  additionalProperties: false,
};

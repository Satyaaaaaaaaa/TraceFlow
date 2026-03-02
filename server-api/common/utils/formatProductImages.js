//This function destructure the link to iimages
function formatProductImages(productJson, req) {

    if (!productJson.Images || !Array.isArray(productJson.Images)) {
        return productJson;
    }

    productJson.Images = productJson.Images.map((img) => ({
        ...img,
        imageUrl: `uploads/products/product_${img.uuid}${img.extension}`
    }));

    return productJson;
}

module.exports = { formatProductImages };

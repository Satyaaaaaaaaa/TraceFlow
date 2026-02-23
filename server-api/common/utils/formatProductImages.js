//This function destructure the link to iimages
function formatProductImages(productJson, req) {

    if (!productJson.Images || !Array.isArray(productJson.Images)) {
        return productJson;
    }

    productJson.Images = productJson.Images.map((img) => ({
        ...img,
        imageUrl: `uploads/products/img_${img.uuid}.jpg`
    }));

    return productJson;
}

module.exports = { formatProductImages };

function extractPrimaryImage(product, req) {

    if (!product.Images || product.Images.length === 0) {
        return null;
    }

    const primary = product.Images.find(img => img.position === 0) 
                    || product.Images[0];

    return `uploads/products/product_${primary.uuid}${primary.extension}`;
}

//todo -> reuse /common/utils/formatImageMapper.js instead of doing it again here.
function mapCartResponse(cart, req) {
    const cartJson = cart.toJSON();

    return {
        id: cartJson.id,
        userId: cartJson.userID,
        items: cartJson.CartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            product: {
                id: item.Product.id,
                name: item.Product.name,
                price: item.Product.price,
                image: extractPrimaryImage(item.Product, req)
            }
        })),
        createdAt: cartJson.createdAt,
        updatedAt: cartJson.updatedAt
    };
}

module.exports = { mapCartResponse };

module.exports = {
    port: 3001,
    ADDRESS: '0.0.0.0',
    jwtExpirationInSeconds: 60 * 60 * 60,
    roles: {
        //CONVERTED TO UPPERCASE 
        BUYER: 'BUYER',
        ADMIN: 'ADMIN',
        SELLER: 'SELLER'
    },
    productPriceUnits: {
        INR: 'inr'
    }
}
module.exports = {
    port: 3001,
    jwtExpirationInSeconds: 60 * 60 * 60,
    roles: {
        //CONVERTED TO UPPERCASE 
        USER: 'USER',
        ADMIN: 'ADMIN',
        SELLER: 'SELLER'
    },
    productPriceUnits: {
        INR: 'inr'
    }
}
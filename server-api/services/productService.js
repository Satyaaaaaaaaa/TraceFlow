const { createProduct, findProduct, updateProduct } = require('../common/models/Product');
const { getContract } = require('./fabricService');

/**
 * Creates a product in the SQL database and its corresponding asset on the blockchain.
 * @param {object} productData - Data for the new product (name, description, etc.).
 * @param {string} ownerId - The username of the user creating the product.
 */
async function createProductWithTraceability(productId, productName, ownerId) {
    // 1. Create product in the primary SQL database
    //const newProduct = await createProduct(productData);

    let gateway;
    try {

        //Temporary line to skip blockchain.
        const SKIP_BLOCKCHAIN = true; // toggle this later

        if (SKIP_BLOCKCHAIN) {
            console.log("Successfully skipped blockchain enrollment");
            return { success: true };
        }

        // 2. Connect to the Fabric network
        const { gateway: gw, contract } = await getContract(ownerId);
        gateway = gw;

        // 3. Submit the transaction to the blockchain ledger
        console.log(`\n--> Submit Transaction: createProductAsset, ID: ${productId}, Name: ${productName}, Owner: ${ownerId}`);
        await contract.submitTransaction(
            'createProductAsset',
            productId.toString(),
            productName,
            ownerId
        );
        console.log('*** Result: committed');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        // Optional: Add logic to roll back the SQL database insertion if the blockchain part fails.
        // await deleteProduct({ id: newProduct.id }); 
        throw new Error(`Failed to create product asset on blockchain. ${error.message}`);
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }

    return { success : true, body : {productId, productName, ownerId}};
}

/**
 * Fetches product details from SQL and its full history from the blockchain.
 * @param {string} productId - The ID of the product.
 * @param {string} userId - The username of the user requesting the data.
 */
async function getFullProductDetails(productId, userId) {
    // 1. Get main product details from SQL
    const productDetails = await findProduct({ id: productId });
    if (!productDetails) {
        throw new Error('Product not found in database');
    }

    let gateway;
    try {
        // 2. Get traceability history from Fabric
        const { gateway: gw, contract } = await getContract(userId);
        gateway = gw;

        //Todo : userId and contract thing

        console.log(`\n--> Evaluate Transaction: getProductHistory, ID: ${productId}`);
        const result = await contract.evaluateTransaction('getProductHistory', productId);
        console.log(`*** Result: ${result.toString()}`);
        
        const history = JSON.parse(result.toString());

        //QUESTION: SHOULD WE COMBINE SQL PRODUCT DETAILS AND BLOCKCHAIN PRODUCT DETAILS? OR RELY ENTRIERLY ON ONE(EITHER SQL OR BLOCKCHAIN)
        // 3. Combine and return
        return {
            ...productDetails.toJSON(),
            traceabilityHistory: history
        };
    } catch (error) {
        console.error(`Failed to get product history: ${error}`);
        // Return product details even if history fails, but log the error
        return {
            ...productDetails.toJSON(),
            traceabilityHistory: [],
            error: 'Could not fetch traceability history.'
        };
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }
}

// You can create similar wrapper functions for updateStatus and transferOwnership
// For example:
async function updateProductStatusWithTraceability(productId, newStatus, actorId) {
    await updateProduct({ id: productId }, { status: newStatus }); // Assuming you add a 'status' field to your Product model

    let gateway;
    try {
        const { gateway: gw, contract } = await getContract(actorId);
        gateway = gw;
        await contract.submitTransaction('updateStatus', productId, newStatus, actorId);
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }
}

async function transferOwnershipWithTraceability(productId, newOwnerId, actorId) {

    let gateway;

    try {
        // 1. Connect to Fabric as the ACTOR (current owner)
        const { gateway: gw, contract } = await getContract(actorId);
        gateway = gw;

        console.log(
            `\n--> Submit Transaction: transferOwnership | ProductID: ${productId} | NewOwner: ${newOwnerId} | Actor: ${actorId}`
        );

        // 2. Submit ownership transfer to ledger
        const result = await contract.submitTransaction(
            'transferOwnership',
            productId.toString(),
            newOwnerId
        );

        console.log('*** Ownership transfer committed on ledger');

        return result;

    } catch (error) {
        console.error(`Failed to transfer ownership: ${error}`);
        throw new Error(`Ownership transfer failed. ${error.message}`);
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }
}

module.exports = {
    createProductWithTraceability,
    getFullProductDetails,
    updateProductStatusWithTraceability,
    transferOwnershipWithTraceability
};

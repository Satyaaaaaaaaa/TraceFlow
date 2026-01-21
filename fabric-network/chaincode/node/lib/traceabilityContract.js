/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class TraceabilityContract extends Contract {

    /**
     * Initializes the ledger with some sample product assets.
     * This function is typically called once when the chaincode is instantiated.
     * @param {Context} ctx the transaction context
     */

    //================TIMESTAMP FUNCTION===================//

    _getTxTimestampISO(ctx) {
        const txTime = ctx.stub.getTxTimestamp();
        const seconds = txTime.seconds.low;
        const nanos = txTime.nanos;

        const millis =
            seconds * 1000 + Math.floor(nanos / 1_000_000);

        return new Date(millis).toISOString();
    }

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        const products = [
            {
                productID: 'product1', //MUST BE UNIQUE
                name: 'Organic Lakadong Turmeric',
                owner: 'Megha-Farmers-Coop',
                status: 'Harvested',
                history: [
                    {
                        timestamp: this._getTxTimestampISO(ctx),
                        actor: 'Farmer A',
                        action: 'Harvested at Lakadong, Meghalaya'
                    }
                ]
            },
            {
                productID: 'product2',
                name: 'Handmade Bamboo Basket',
                owner: 'Artisan-Collective-Shillong',
                status: 'Crafted',
                history: [
                    {
                        timestamp: this._getTxTimestampISO(ctx),
                        actor: 'Artisan B',
                        action: 'Crafted in Shillong, Meghalaya'
                    }
                ]
            },
        ];

        for (const product of products) {
            product.docType = 'productAsset';
            await ctx.stub.putState(product.productID, Buffer.from(JSON.stringify(product)));
            console.info(`Asset ${product.productID} initialized`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * Creates a new product asset on the ledger.
     * @param {Context} ctx The transaction context.
     * @param {string} productID The ID of the product in the main database.
     * @param {string} name The name of the product.
     * @param {string} owner The initial owner of the product (e.g., seller's ID).
     */
    async createProductAsset(ctx, productID, name, owner) {
        console.info('============= START : Create Product Asset ===========');

        const productAsset = {
            docType: 'productAsset',
            productID, // TODO: Should be unique
            name,
            owner,
            status: 'Created',
            history: [{
                timestamp: this._getTxTimestampISO(ctx),
                actor: owner,
                action: 'Product Asset Created'
            }]
        };

        await ctx.stub.putState(productID, Buffer.from(JSON.stringify(productAsset)));
        console.info('============= END : Create Product Asset ===========');
        return JSON.stringify(productAsset);
    }

    /**
     * Retrieves the current state of a product asset from the ledger.
     * @param {Context} ctx The transaction context.
     * @param {string} productID The ID of the product.
     * @returns {Promise<string>} The product asset as a JSON string.
     */
    async getProductAsset(ctx, productID) {
        const assetJSON = await ctx.stub.getState(productID);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${productID} does not exist`);
        }
        return assetJSON.toString();
    }

    /**
     * Updates the status of a product asset.
     * @param {Context} ctx The transaction context.
     * @param {string} productID The ID of the product.
     * @param {string} newStatus The new status (e.g., 'Shipped', 'In Transit', 'Delivered').
     * @param {string} actor The entity performing the action.
     */
    async updateStatus(ctx, productID, newStatus, actor) {
        console.info('============= START : updateStatus ===========');

        const assetString = await this.getProductAsset(ctx, productID);
        const productAsset = JSON.parse(assetString);

        productAsset.status = newStatus;
        productAsset.history.push({
            timestamp: this._getTxTimestampISO(ctx),
            actor: actor,
            action: `Status updated to ${newStatus}`
        });

        await ctx.stub.putState(productID, Buffer.from(JSON.stringify(productAsset)));
        console.info('============= END : updateStatus ===========');
        return JSON.stringify(productAsset);
    }

    /**
     * Transfers the ownership of a product asset to a new owner.
     * @param {Context} ctx The transaction context.
     * @param {string} productID The ID of the product.
     * @param {string} newOwner The ID of the new owner.
     */
    async transferOwnership(ctx, productID, newOwner) {
        console.info('============= START : transferOwnership ===========');

        const assetString = await this.getProductAsset(ctx, productID);
        const productAsset = JSON.parse(assetString);
        const oldOwner = productAsset.owner;
        productAsset.owner = newOwner;

        productAsset.history.push({
            timestamp: this._getTxTimestampISO(ctx),
            actor: newOwner, // The new owner is the actor in a transfer
            action: `Ownership transferred from ${oldOwner} to ${newOwner}`
        });

        await ctx.stub.putState(productID, Buffer.from(JSON.stringify(productAsset)));
        console.info('============= END : transferOwnership ===========');
        return JSON.stringify(productAsset);
    }

    /**
     * Retrieves the complete history of a product asset.
     * @param {Context} ctx The transaction context.
     * @param {string} productID The ID of the product.
     * @returns {Promise<string>} The history of the asset as a JSON string.
     */
    async getProductHistory(ctx, productID) {
        const promiseOfIterator = ctx.stub.getHistoryForKey(productID);
        const results = [];
        for await (const keyMod of promiseOfIterator) {
            const resp = {
                timestamp: keyMod.timestamp,
                txId: keyMod.txId,
                value: {}
            };
            if (keyMod.isDelete) {
                resp.value = 'isDelete';
            } else {
                try {
                    resp.value = JSON.parse(Buffer.from(keyMod.value).toString('utf8'));
                } catch (err) {
                    console.log(err);
                    resp.value = Buffer.from(keyMod.value).toString('utf8');
                }
            }
            results.push(resp);
        }
        return JSON.stringify(results);
    }
}

module.exports = TraceabilityContract;
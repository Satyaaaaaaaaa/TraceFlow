const { getFullProductDetails } = require("../../services/productService");

module.exports = {
    verifyAsset: async (req, res) => {
        try {
            const { asset_id } = req.body;

            if (!asset_id) {
                return res.status(400).json({
                    message: 'asset_id is required'
                });
            }

            //TODO
            const PUBLIC_USER_ID = 'admin';

            const product = await getFullProductDetails(
                asset_id,
                PUBLIC_USER_ID
            );

            //OUTPUT FROM BLOCKCHAIN

            // Chaincode invoke successful. result: status:200 payload:
            // "[{\"timestamp\":{\"seconds\":1770707887,\"nanos\":601000000},
            // \"txId\":\"75c7efdd2ad8e35a9980fd0d618f30a31c32520caaa6cf68f7e424cc105581c6\",
            // \"value\":{\"docType\":\"productAsset\",
            // \"productID\":\"1\",\"
            // name\":\"watch\",
            // \"owner\":\"abc\",
            // \"status\":\"Created\",
            // \"history\":[{\"timestamp\":\"2026-02-10T07:18:07.601Z\",\"actor\":\"abc\",\"action\":\"Product Asset Created\"}]}}]"



            const timeline = [];

            (product.traceabilityHistory || []).forEach(record => {
                const historyEntries = record.value?.history || [];

                historyEntries.forEach(h => {
                    timeline.push({
                        stage: h.action,
                        actor: h.actor,
                        location: record.value.owner,
                        timestamp: h.timestamp
                    });
                });
            });

            return res.status(200).json({
                assetId: asset_id,
                isAuthentic: timeline.length > 0,
                productName: product.name,
                timeline
            });

        } catch (error) {
            console.error('VERIFY ASSET FAILED:', error.message);

            return res.status(200).json({
                assetId: req.body.asset_id || 'UNKNOWN-ASSET',
                isAuthentic: false,
                timeline: []
            });
        }
    }
};

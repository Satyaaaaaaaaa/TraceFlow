'use strict';

const { Wallets, Gateway } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const caTLSCACertsPath = path.resolve(
    __dirname,
    '..', '..', '..',
    'fabric-samples',
    'test-network', 'organizations', 'fabric-ca', 'org1', 'tls-cert.pem'
);

// --- Helper Functions ---

/**
 * Locates the connection profile (connection.json) file.
 * @returns {object} The parsed connection profile JSON object.
 */
function getCCP() {
    const ccpPath = path.resolve(
        __dirname, 
        '..', '..', '..', 
        'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    return JSON.parse(ccpJSON);
}

/**
 * Gets a reference to the file system wallet.
 * @returns {Promise<Wallet>} The wallet instance.
 */
async function getWallet() {
    const walletPath = path.join(process.cwd(), '..', 'fabric-network', 'wallet');
    console.log("Wallet Path:", walletPath);
    return await Wallets.newFileSystemWallet(walletPath);
}

// --- Main Service Functions ---

/**
 * Enrolls a new user with the Certificate Authority.
 * @param {string} userId The username of the user to enroll.
 * @param {string} role The role of the user (e.g., 'client', 'admin').
 */
async function enrollUser(userId, role) {
    try {
        //temporary line to skip blockchain 
        const SKIP_BLOCKCHAIN = true; // 🔥 toggle this later

        if (SKIP_BLOCKCHAIN) {
            console.log("Successfully skipped blockchain enrollment");
            return { success: true };
        }

        //Temporary line to fail blockchain.
        //throw new Error('Failed blockchain haha');

        const ccp = getCCP();
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        // const caTLSCACerts = caInfo.tlsCACerts.pem;
        const caTLSCACerts = fs.readFileSync(caTLSCACertsPath, 'utf8');
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        const wallet = await getWallet();

        // Check if the user is already enrolled
        const identity = await wallet.get(userId);
        if (identity) {
            console.log(`An identity for the user "${userId}" already exists in the wallet`);
            throw new Error('Already exists in the wallet with a different x509 identity - Access deniey')
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            // You should run enrollAdmin.js script from fabric-samples first
            throw new Error('Admin identity not found in wallet. Run enrollAdmin.js first.');
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: userId,
            role: role || 'client' // Default to 'client' role
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        await wallet.put(userId, x509Identity);
        console.log(`Successfully registered and enrolled user "${userId}" and imported it into the wallet`);

        return { success : true }

    } catch (error) {
        console.error(`Failed to enroll user "${userId}": ${error}`);
        // In a real app, you'd want to handle this error more gracefully
        throw error;
    }
}

/**
 * Connects to the gateway and returns a contract instance.
 * @param {string} userId The user to connect as.
 * @returns {Promise<{gateway: Gateway, contract: Contract}>}
 */
async function getContract(userId) {
    const wallet = await getWallet();
    const ccp = getCCP();

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userId);
    if (!identity) {
        console.log(`An identity for the user "${userId}" does not exist in the wallet.`);
        // Enroll the user if not found. This is a fallback.
        // Ideally, enrollment happens at registration.
        await enrollUser(userId, 'client'); 
        const newIdentity = await wallet.get(userId);
        if (!newIdentity) {
            throw new Error(`Failed to enroll and find identity for user ${userId}. Please register first.`);
        }
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });
    
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('traceability'); // 'traceability' is the chaincode name

    return { gateway, contract };
}

module.exports = {
    enrollUser,
    getContract
};

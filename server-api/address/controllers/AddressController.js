const { Address, User } = require('../../common/models/associations');
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

//todo: no ADDRESS validation, glitch -> anyone can view Anyone's adress ADDDRESS, no  create ADRESS payload

exports.createAddress = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    const { userId } = decoded; // User ID from JWT
    const { name, phoneNumber, pincode, city, state, locality, buildingName, landmark } = req.body;

    try {
        // Ensure the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        // Create the address
        const address = await Address.create({
            userID: userId,
            name,
            phoneNumber,
            pincode,
            city,
            state,
            locality,
            buildingName,
            landmark,
        });

        return res.status(201).json({
            status: true,
            message: "Address created successfully",
            data: address,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "An error occurred while creating the address",
            error: error.message,
        });
    }
};

exports.getAddresses = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    const { userId } = decoded;

    try {
        const addresses = await Address.findAll({
            where: { userID: userId },
        });

        if (!addresses || addresses.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No addresses found for this user",
            });
        }

        return res.status(200).json({
            status: true,
            data: addresses,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching addresses",
            error: error.message,
        });
    }
};

exports.updateAddress = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    const { userId } = decoded;
    const { addressId, ...updatedValues } = req.body;

    try {
        const address = await Address.findOne({
            where: { id: addressId, userID: userId },
        });

        if (!address) {
            return res.status(404).json({
                status: false,
                message: "Address not found or does not belong to the user",
            });
        }

        await address.update(updatedValues);

        return res.status(200).json({
            status: true,
            message: "Address updated successfully",
            data: address,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "An error occurred while updating the address",
            error: error.message,
        });
    }
};

exports.deleteAddress = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    const { userId } = decoded;
    const { addressId } = req.query;

    try {
        const rowsDeleted = await Address.destroy({
            where: { id: addressId, userID: userId },
        });

        if (rowsDeleted === 0) {
            return res.status(404).json({
                status: false,
                message: "Address not found or does not belong to the user",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "An error occurred while deleting the address",
            error: error.message,
        });
    }
};

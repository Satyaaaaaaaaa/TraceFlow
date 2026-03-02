const { Pincode } = require("../../common/models/Pincode");
const axios = require("axios");

exports.getLocationFromPincode = async (req, res) => {

    const { pincode } = req.params;

    if (!/^\d{6}$/.test(pincode))
        return res.status(400).json({ success:false });

    // CHECK CACHE FIRST
    const existing = await Pincode.findOne({
        where: { pincode }
    });

    if (existing) {
        return res.json({
            success: true,
            data: existing
        });
    }

    // CALL POSTAL API
    const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
    );

    const office =
        response.data[0].PostOffice[0];

    // SAVE CACHE
    const saved = await Pincode.create({
        pincode,
        city: office.District,
        state: office.State,
        country: office.Country
    });

    return res.json({
        success: true,
        data: saved
    });
};
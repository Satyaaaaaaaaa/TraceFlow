const bcrypt = require("bcrypt");
const  cacheService  = require("../../infrastructure/cache/redis/cacheService");
const { generateOTP } = require("../utils/otp");

// Move to .env later
const OTP_EXPIRY = 600; // 10 minutes
const MAX_ATTEMPTS = 5;


// CREATE OTP
async function createResetOTP(email) {

    //Generate random otp
    const otp = generateOTP();

    //Hash it
    const hashedOtp = await bcrypt.hash(otp, 10);

    //create two keys -> 
    //otp:reset:abc@gmail.com -> [hashedOtp] 600seconds
    //otp:attempts:abc@gmail.com -> [0] 600seconds

    const otpKey = `otp:reset:${email}`;
    const attemptKey = `otp:attempts:${email}`;

    await cacheService.set(otpKey, hashedOtp, OTP_EXPIRY);
    await cacheService.set(attemptKey, 0, OTP_EXPIRY);

    return otp;
}


// VERIFY OTP
async function verifyResetOTP(email, otp) {
    const otpKey = `otp:reset:${email}`;
    const attemptKey = `otp:attempts:${email}`;

    const hashedOtp = await cacheService.get(otpKey);

    if (!hashedOtp) {
        throw new Error("OTP expired");
    }

    const attempts = (await cacheService.get(attemptKey)) || 0;

    if (attempts >= MAX_ATTEMPTS) {
        throw new Error("Too many attempts");
    }

    const valid = await bcrypt.compare(otp, hashedOtp);

    if (!valid) {
        await cacheService.set(attemptKey, attempts + 1, 600);
        throw new Error("Invalid OTP");
    }

    // ✅ success → clear everything
    await cacheService.del(otpKey);
    await cacheService.del(attemptKey);

    return true;
}


module.exports = {
    createResetOTP,
    verifyResetOTP
};
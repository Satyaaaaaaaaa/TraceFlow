const bcrypt = require("bcrypt");
const redis = require("../config/redis");
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

    await redis.set(otpKey, hashedOtp, "EX", OTP_EXPIRY);
    await redis.set(attemptKey, 0, "EX", OTP_EXPIRY);

    return otp;
}


// VERIFY OTP
async function verifyResetOTP(email, otp) {

    //structure the keys
    //otp:reset:abc@gmail.com -> [hashedOtp] 600seconds
    //otp:attempts:abc@gmail.com -> [0] 600seconds
    const otpKey = `otp:reset:${email}`;
    const attemptKey = `otp:attempts:${email}`;

    //extract [hashedOtp] from the key structred
    const hashedOtp = await redis.get(otpKey);

    //if expired
    if (!hashedOtp) {
        throw new Error("OTP expired");
    }

    //extract the number of attempts
    const attempts = await redis.get(attemptKey);

    //if attempts
    if (attempts >= MAX_ATTEMPTS) {
        throw new Error("Too many attempts");
    }

    //Match the otps
    const valid = await bcrypt.compare(otp, hashedOtp);

    if (!valid) {
        await redis.incr(attemptKey);
        throw new Error("Invalid OTP");
    }

    return true;
}


// CLEAR OTP
async function clearOTP(email) {

    await redis.del(`otp:reset:${email}`);
    await redis.del(`otp:attempts:${email}`);
}


module.exports = {
    createResetOTP,
    verifyResetOTP,
    clearOTP
};
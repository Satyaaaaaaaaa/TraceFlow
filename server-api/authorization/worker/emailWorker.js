// workers/email.worker.js
import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import redis from "../config/redis.js";

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASS
//     }
// });

const worker = new Worker(
  "emailQueue",
  async (job) => {

    const { email, otp } = job.data;

    //TEMPORARY: skip nodemailer
    console.log("========== DEV EMAIL ==========");
    console.log("Send OTP:", otp);
    console.log("To:", email);
    console.log("================================");

    return true;
  },
  {
    connection: redis
  }
);

module.exports = worker;
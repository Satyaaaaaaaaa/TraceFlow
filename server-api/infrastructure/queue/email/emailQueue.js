const { Queue } = require("bullmq");
const redis = require("../../cache/redis/redis");

const EMAIL_QUEUE_NAME = "emailQueue";

const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection: redis
});
module.exports = {
    emailQueue
};
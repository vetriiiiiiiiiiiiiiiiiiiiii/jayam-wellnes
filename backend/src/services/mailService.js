const { mailQueue } = require('./queue');

const sendEmail = async (to, subject, html) => {
  try {
    const job = await mailQueue.add('sendEmail', {
      to,
      subject,
      html
    });
    console.log(`Email job enqueued successfully. Job ID: ${job.id}`);
    return job;
  } catch (error) {
    console.error("Failed to enqueue email job:", error);
    throw error;
  }
};

module.exports = {
  sendEmail
};

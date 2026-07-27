const { Worker } = require('bullmq');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

// Setup Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_USE_TLS === 'False' ? false : true,
  auth: {
    user: process.env.EMAIL_HOST_USER || '',
    pass: process.env.EMAIL_HOST_PASSWORD || '',
  },
});

console.log('🚀 Starting BullMQ Mail Worker Service connected to Redis at:', redisUrl);

// Create BullMQ Worker for queue 'mail-queue'
const worker = new Worker(
  'mail-queue',
  async (job) => {
    console.log(`📩 Processing Mail Job #${job.id} (${job.name}) for: ${job.data.to}`);
    const { to, subject, text, html } = job.data;

    if (!to || !subject) {
      throw new Error('Invalid email payload: missing recipient or subject.');
    }

    // If SMTP user is not configured in .env, simulate successful email dispatch
    if (!process.env.EMAIL_HOST_USER) {
      console.log(`[SIMULATED MAIL] To: ${to} | Subject: "${subject}"`);
      return { status: 'simulated', to, subject };
    }

    const info = await transporter.sendMail({
      from: process.env.DEFAULT_FROM_EMAIL || '"Trip Planner" <noreply@tripplanner.com>',
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ Email sent successfully! MessageID: ${info.messageId}`);
    return { status: 'sent', messageId: info.messageId };
  },
  { connection }
);

worker.on('completed', (job, result) => {
  console.log(`🎉 Job ${job.id} completed!`, result);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error:`, err.message);
});

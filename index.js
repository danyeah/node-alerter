import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import jwt from 'jsonwebtoken';
import { config } from './config_cimea.js';

const app = express();
app.use(express.json());

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Initialize Mailgun
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

// Message sending functions
async function sendTelegramMessage(message) {
  try {
    // Convert group ID to the format Telegram Bot API expects
    let groupId = config.telegramGroupId;
    if (!groupId.startsWith('-100')) {
      // If the ID is already negative, remove the minus and add -100
      groupId = '-100' + groupId.replace('-', '');
    }
    
    await bot.sendMessage(groupId, message);
    return true;
  } catch (error) {
    console.error('Telegram error:', error);
    return false;
  }
}

async function sendEmail(message) {
  try {
    const messageData = {
      from: config.emailFrom,
      to: config.recipientEmails,
      subject: 'New Alert',
      text: message
    };

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
    console.log('Mailgun response:', result); // Log the response for debugging
    return true;
  } catch (error) {
    console.error('Mailgun error:', error);
    // Throw the error so Promise.allSettled can catch it
    throw error;
  }
}

// API endpoint with JWT authentication
app.post(config.endpoint, authenticateJWT, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  console.log('Received message:', message);

  const results = await Promise.allSettled([
    sendTelegramMessage(message),
    sendEmail(message)
  ]);

  const [telegramResult, emailResult] = results;
  const success = telegramResult.status === 'fulfilled' || emailResult.status === 'fulfilled';

  if (!success) {
    return res.status(500).json({
      error: 'Failed to send message through all channels',
      details: {
        telegram: telegramResult.status === 'rejected' ? telegramResult.reason.message : 'Success',
        email: emailResult.status === 'rejected' ? emailResult.reason.message : 'Success'
      }
    });
  }

  res.json({
    success: true,
    details: {
      telegram: {
        success: telegramResult.status === 'fulfilled',
        error: telegramResult.status === 'rejected' ? telegramResult.reason.message : null
      },
      email: {
        success: emailResult.status === 'fulfilled',
        error: emailResult.status === 'rejected' ? emailResult.reason.message : null
      }
    }
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Message endpoint: ${config.endpoint}`);
}); 
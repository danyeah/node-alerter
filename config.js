export const config = {
  // Server configuration
  port: 3000,
  endpoint: '/api/message',

  // Telegram configuration
  telegramGroupId: process.env.TELEGRAM_GROUP_ID || '-11111111', // ID from web UI

  // Email configuration
  recipientEmails: process.env.EMAIL_RECIPIENT || ['notifications@email.com'], // Add your recipient emails
  emailFrom: process.env.EMAIL_FROM || 'TG Alerter <from@email.com>' // Replace with your sender email
}; 
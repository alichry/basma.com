import mailgun from 'mailgun-js';

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY || "",
  domain: process.env.MAILGUN_DOMAIN || ""
});

export const from = process.env.MAILGUN_FROM || ""
export const cronEmailReceiver = process.env.CRON_EMAIL_RECEIVER || "";

export { mg as mailgun };

import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

export class GmailService {
  constructor() {
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async listEmails(userId) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: 10
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch emails');
    }
  }

  async sendEmail(userId, email) {
    try {
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: email
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }
}

export const gmailService = new GmailService();

export const fetchEmails = async (userTokens) => {
  oauth2Client.setCredentials(userTokens);
  const response = await gmailService.listEmails('me');

  const emails = await Promise.all(
    response.messages.map(async (message) => {
      const email = await gmailService.gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });
      return {
        id: email.data.id,
        snippet: email.data.snippet,
        headers: email.data.payload.headers,
      };
    })
  );

  return emails;
};

export const sendEmailMessage = async (userTokens, to, subject, message) => {
  oauth2Client.setCredentials(userTokens);

  const email = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    message
  ].join('\n');

  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmailService.sendEmail('me', encodedEmail);
};

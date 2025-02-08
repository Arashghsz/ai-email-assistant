import { fetchEmails, sendEmailMessage } from '../services/gmailService.js';

export const getEmails = async (req, res) => {
  try {
    const userTokens = req.user.tokens;
    const emails = await fetchEmails(userTokens);
    res.json({ emails });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

export const listEmails = async (req, res) => {
  try {
    const userTokens = req.user.tokens;
    const emails = await fetchEmails(userTokens);
    res.json({ emails });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const userTokens = req.user.tokens;
    const { to, subject, message } = req.body;
    await sendEmailMessage(userTokens, to, subject, message);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
};

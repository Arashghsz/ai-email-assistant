import express from 'express';
import { google } from 'googleapis';
import { authCheck } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authCheck);

// Get all emails
router.get('/list', async (req, res) => {
  try {
    console.log('Creating Gmail service...');
    const gmail = google.gmail({ 
      version: 'v1', 
      auth: req.oauth2Client 
    });
    
    console.log('Fetching email list...');
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      labelIds: ['INBOX']  // Only get inbox messages
    });
    
    if (!response.data.messages) {
      console.log('No messages found');
      return res.json({ messages: [] });
    }

    console.log(`Found ${response.data.messages.length} messages`);
    
    // Fetch detailed information for each message
    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',  // Get metadata only for performance
          metadataHeaders: ['Subject', 'From', 'Date']
        });
        
        // Extract email headers
        const headers = {};
        details.data.payload.headers.forEach(header => {
          headers[header.name.toLowerCase()] = header.value;
        });

        return {
          id: details.data.id,
          threadId: details.data.threadId,
          snippet: details.data.snippet,
          subject: headers.subject || 'No Subject',
          from: headers.from || 'Unknown',
          date: headers.date || 'No Date',
          labelIds: details.data.labelIds || []
        };
      })
    );

    res.json({ messages });
  } catch (error) {
    console.error('Email fetch error:', error.message);
    res.status(error.code === 401 ? 401 : 500).json({ 
      error: 'Failed to fetch emails',
      details: error.message 
    });
  }
});

// Get email by ID
router.get('/:id', async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: req.oauth2Client });
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: req.params.id,
      format: 'full'
    });

    // Get thread messages if it's part of a thread
    let threadMessages = [];
    if (response.data.threadId) {
      const thread = await gmail.users.threads.get({
        userId: 'me',
        id: response.data.threadId
      });
      threadMessages = thread.data.messages || [];
    }

    res.json({
      ...response.data,
      threadMessages
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// Search emails
router.get('/search/:query', async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: req.oauth2Client });
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: req.params.query,
      maxResults: 20
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search emails' });
  }
});

// Send email
router.post('/send', async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: req.oauth2Client });
    const { to, subject, message } = req.body;
    
    const encodedMessage = Buffer.from(
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: text/plain; charset="UTF-8"\r\n` +
      `\r\n` +
      `${message}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/reply', async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: req.oauth2Client });
    const { to, subject, message, threadId, inReplyTo, references } = req.body;
    
    // Create email with threading headers
    const emailLines = [];
    emailLines.push(`To: ${to}`);
    emailLines.push(`Subject: ${subject}`);
    emailLines.push('Content-Type: text/plain; charset="UTF-8"');
    emailLines.push('MIME-Version: 1.0');
    
    // Add threading headers
    if (inReplyTo) {
      emailLines.push(`In-Reply-To: ${inReplyTo}`);
    }
    if (references) {
      emailLines.push(`References: ${references}`);
    }
    
    emailLines.push('');
    emailLines.push(message);

    const encodedMessage = Buffer.from(emailLines.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: threadId
      }
    });

    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Send reply error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

router.post('/messages/:messageId/read', async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: req.oauth2Client });
    
    await gmail.users.messages.modify({
      userId: 'me',
      id: req.params.messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export { router };

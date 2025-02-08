import dotenv from 'dotenv';
dotenv.config();

// Add this after dotenv config
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.REDIRECT_URI) {
  console.error('Missing required environment variables. Please check your .env file');
  process.exit(1);
}

// Add this after dotenv.config()
console.log('Checking Groq API key:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');

import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';

// Service routes
import { router as authRouter } from './auth-service/routes/authRoutes.js';
import { router as emailRouter } from './email-service/routes/emailRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly'
];

app.use(express.json());

app.use(cors());

// Add middleware before routes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Service endpoints
app.use('/auth', authRouter);
app.use('/api/email', emailRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', services: ['auth', 'email'] });
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

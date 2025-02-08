import express from 'express';
import { google } from 'googleapis';
import { oauth2Client, SCOPES } from '../config/auth.config.js';

const router = express.Router();

// Login endpoint
router.get('/login', (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      include_granted_scopes: true,
      prompt: 'consent'
    });

    console.log('Generated auth URL:', authUrl); // Debug log
    
    if (!authUrl) {
      throw new Error('Failed to generate authentication URL');
    }

    res.json({ authUrl });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to generate auth URL',
      details: error.message 
    });
  }
});

// Callback endpoint
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/auth/error?message=No authorization code provided`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Encode data for URL-safe transfer
    const data = JSON.stringify({
      tokens,
      user: userInfo.data
    });

    console.log('Redirecting with data:', data); // Debug log

    // Redirect to frontend with data
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?data=${encodeURIComponent(data)}`);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.redirect(`${process.env.CLIENT_URL}/auth/error?message=${encodeURIComponent(error.message)}`);
  }
});

// Token validation endpoint
router.post('/verify', async (req, res) => {
  const { access_token } = req.body;
  try {
    oauth2Client.setCredentials({ access_token });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    res.json(userInfo.data);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Revoke access endpoint
router.post('/revoke', async (req, res) => {
  const { token } = req.body;
  
  try {
    // Revoke the token
    await oauth2Client.revokeToken(token);
    // Clear credentials
    oauth2Client.setCredentials(null);
    
    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke error:', error);
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

// Logout endpoint
router.get('/logout', (req, res) => {
  try {
    oauth2Client.setCredentials(null);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export { router };

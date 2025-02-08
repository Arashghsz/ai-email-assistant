import { google } from 'googleapis';

export const authCheck = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    // Check if token is expired
    const tokenInfo = await oauth2Client.getTokenInfo(token);
    console.log('Token info:', { ...tokenInfo, access_token: '[REDACTED]' });

    oauth2Client.setCredentials({
      access_token: token,
      token_type: 'Bearer',
      expiry_date: tokenInfo.expiry_date
    });

    // Test the token with a simple API call
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    await gmail.users.getProfile({ userId: 'me' });

    req.oauth2Client = oauth2Client;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    if (error.message.includes('invalid_token') || error.message.includes('Invalid Credentials')) {
      return res.status(401).json({ 
        error: 'Token expired or invalid',
        details: 'Please reauthenticate'
      });
    }
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message 
    });
  }
};

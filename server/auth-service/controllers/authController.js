import { oauth2Client, SCOPES } from '../config/auth.config.js';
import { createUserSession, removeUserSession } from '../services/userService.js';

export const login = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  res.json({ url: authUrl });
};

export const callback = async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Get user info from Google
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2('v2');
    const { data } = await oauth2.userinfo.get();
    
    // Create user session
    createUserSession(data.id, tokens);
    
    // Redirect with user info
    res.redirect(`${process.env.CLIENT_URL}/dashboard?userId=${data.id}&email=${data.email}`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate' });
  }
};

export const logout = (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    removeUserSession(userId);
  }
  res.json({ message: 'Logged out successfully' });
};

export const handleGoogleCallback = async (req, res) => {
  try {
    // TODO: Implement Google OAuth logic
    res.status(200).json({ message: "Authentication successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

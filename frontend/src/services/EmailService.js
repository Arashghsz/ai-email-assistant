const API_URL = 'http://localhost:5000/api/email';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const EmailService = {
  async listEmails(token) {
    try {
      const response = await fetch(`${API_URL}/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Email response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      throw error;
    }
  },

  async getEmail(id, token) {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch email');
    return response.json();
  },

  async sendEmail(data, token) {
    try {
      const response = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Send email failed:', error);
      throw error;
    }
  },

  async searchEmails(token, query) {
    try {
      const response = await fetch(`${API_URL}/search/${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  },

  async checkNewEmails(token, lastCheckTime) {
    try {
      const response = await fetch(`${API_URL}/list?after=${lastCheckTime}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Check new emails failed:', error);
      throw error;
    }
  },

  async markAsRead(messageId, token) {
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Mark as read failed:', error);
      throw error;
    }
  },

  async sendReply(data, token) {
    try {
      const response = await fetch(`${API_URL}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: data.to,
          subject: data.subject,
          message: data.message,
          threadId: data.threadId,
          inReplyTo: data.messageId,
          references: data.references
        })
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Reply failed:', error);
      throw error;
    }
  }
};

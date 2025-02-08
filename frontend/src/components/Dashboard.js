import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { EmailService } from '../services/EmailService';
import './Dashboard.css';
import EmailView from './EmailView';
import ComposeModal from './ComposeModal';

function Sidebar({ onComposeClick }) {
  return (
    <div className="sidebar">
      <button className="compose-btn" onClick={onComposeClick}>
        <span className="compose-icon">✏️</span>
        <span>Compose</span>
      </button>
      <nav className="nav-list">
        <div className="nav-item active">
          <span className="nav-icon">📥</span>
          <span>Inbox</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">⭐</span>
          <span>Starred</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">⏱️</span>
          <span>Snoozed</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">📤</span>
          <span>Sent</span>
        </div>
      </nav>
    </div>
  );
}

function EmailList({ emails, onEmailClick }) {
  return (
    <div className="email-list">
      {emails.map(email => {
        const isUnread = email.labelIds?.includes('UNREAD');

        return (
          <div key={email.id} 
               className={`email-item ${isUnread ? 'unread' : ''}`}
               onClick={() => onEmailClick(email)}>
            <div className="email-checkbox">
              <input type="checkbox" onClick={e => e.stopPropagation()} />
            </div>
            <div className="email-sender">{email.from}</div>
            <div className="email-content-preview">
              <span className="email-subject">{email.subject}</span>
              <span className="email-separator">-</span>
              <span className="email-snippet">{email.snippet}</span>
            </div>
            <div className="email-date">{formatDate(email.date)}</div>
          </div>
        );
      })}
    </div>
  );
}

function UserInfo({ user }) {
  return (
    <div className="user-info">
      <img src={user?.picture || '/default-avatar.png'} alt="" className="user-avatar" />
      <div className="user-details">
        <div className="user-name">{user?.name}</div>
        <div className="user-email">{user?.email}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokens, logout, isLoading, user } = useAuth(); // Add user to destructuring
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [viewingEmail, setViewingEmail] = useState(null);
  const [newEmails, setNewEmails] = useState(new Set());
  const [notificationPermission, setNotificationPermission] = useState('default');
  const previousEmails = useRef(new Map());
  const POLLING_INTERVAL = 30000; // 30 seconds
  const [readEmails, setReadEmails] = useState(new Set());

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  const showNotification = useCallback((email) => {
    if (notificationPermission === 'granted') {
      new Notification('New Email', {
        body: `From: ${email.from}\nSubject: ${email.subject}`,
        icon: '/email-icon.png'
      });
    }
  }, [notificationPermission]);

  const fetchEmails = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      console.log('Fetching emails...');
      const response = await EmailService.listEmails(tokens.access_token);
      
      if (!response.messages) {
        throw new Error('No emails found in response');
      }

      console.log(`Fetched ${response.messages.length} emails`);
      setEmails(response.messages);
      setLastCheckTime(Date.now());
    } catch (error) {
      console.error('Error fetching emails:', error);
      if (!silent) {
        setError('Failed to load emails. Please try again.');
      }
      if (error.message.includes('401')) {
        logout();
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tokens, logout]);

  const checkNewEmails = useCallback(async () => {
    try {
      const response = await EmailService.listEmails(tokens.access_token);
      
      if (response.messages) {
        const currentEmails = new Map(
          response.messages.map(email => [email.id, email])
        );
        
        // Find new emails
        const newEmailsFound = new Set();
        currentEmails.forEach((email, id) => {
          if (!previousEmails.current.has(id)) {
            newEmailsFound.add(id);
            showNotification(email);
          }
        });

        // Update state only if there are changes
        if (newEmailsFound.size > 0) {
          setEmails(response.messages);
          setNewEmails(newEmailsFound);
        }

        previousEmails.current = currentEmails;
      }
    } catch (error) {
      console.error('Error checking new emails:', error);
    }
  }, [tokens, showNotification]);

  // Initial fetch
  useEffect(() => {
    if (!isLoading && tokens?.access_token) {
      console.log('Initial fetch of emails');
      fetchEmails();
    }
  }, [tokens, isLoading, fetchEmails]);

  // Polling for new emails
  useEffect(() => {
    if (!tokens?.access_token) return;

    const pollInterval = setInterval(() => {
      fetchEmails(true); // Silent update
    }, POLLING_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [tokens, fetchEmails]);

  // Update polling effect
  useEffect(() => {
    if (!tokens?.access_token) return;

    // Initial fetch
    checkNewEmails();

    const pollInterval = setInterval(checkNewEmails, POLLING_INTERVAL); // Check every 30 seconds

    return () => clearInterval(pollInterval);
  }, [tokens, checkNewEmails]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!searchQuery.trim()) {
        await fetchEmails();
        return;
      }

      const searchResponse = await EmailService.searchEmails(tokens.access_token, searchQuery);
      
      if (!searchResponse.messages) {
        setEmails([]);
        return;
      }

      setEmails(searchResponse.messages);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (emailData) => {
    try {
      setLoading(true);
      await EmailService.sendEmail(emailData, tokens.access_token);
      setShowComposeModal(false);
      await fetchEmails(); // Refresh email list
      setError(null);
    } catch (error) {
      console.error('Send error:', error);
      setError('Failed to send email');
      if (error.message.includes('401')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = async (email) => {
    try {
      setLoading(true);
      const fullEmail = await EmailService.getEmail(email.id, tokens.access_token);
      setViewingEmail(fullEmail);
    } catch (error) {
      console.error('Error fetching email details:', error);
      setError('Failed to load email details');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (replyData) => {
    try {
      await EmailService.sendEmail(replyData, tokens.access_token);
      setViewingEmail(null);
      await fetchEmails();
    } catch (error) {
      console.error('Reply error:', error);
      setError('Failed to send reply');
    }
  };

  const handleEmailRead = (emailId) => {
    setNewEmails(prev => {
      const updated = new Set(prev);
      updated.delete(emailId);
      return updated;
    });
  };

  const markAsRead = useCallback((emailId) => {
    setReadEmails(prev => new Set([...prev, emailId]));
  }, []);

  // Update email item rendering
  const renderEmailItem = (email) => (
    <div 
      key={email.id} 
      className={`email-item ${!readEmails.has(email.id) ? 'email-unread' : ''} ${newEmails.has(email.id) ? 'email-new' : ''}`}
      onClick={() => {
        handleEmailClick(email);
        markAsRead(email.id);
        handleEmailRead(email.id);
      }}
    >
      <div className="email-status">
        {!readEmails.has(email.id) && <span className="unread-dot" />}
        {newEmails.has(email.id) && <div className="new-email-indicator" />}
      </div>
      <div className="email-header">
        <span className="email-from">{email.from}</span>
        <span className="email-date">
          {email.date ? new Date(email.date).toLocaleString() : 'No date'}
        </span>
      </div>
      <div className="email-content">
        <h3 className="email-subject">{email.subject || 'No subject'}</h3>
        <p className="email-snippet">{email.snippet || 'No preview available'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Loading your emails...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchEmails} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo">📧</span>
          <h1>AI Email Assistant</h1>
        </div>
        
        <form className="search-container" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search in emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>

        <div className="header-right">
          <UserInfo user={user} />
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-main">
        <Sidebar onComposeClick={() => setShowComposeModal(true)} />

        <main className="email-container">
          <EmailList 
            emails={emails}
            onEmailClick={(email) => {
              handleEmailClick(email);
              markAsRead(email.id);
              handleEmailRead(email.id);
            }}
          />
        </main>
      </div>

      {viewingEmail && (
        <EmailView 
          email={viewingEmail}
          onClose={() => setViewingEmail(null)}
          onReply={handleReply}
        />
      )}

      {showComposeModal && (
        <ComposeModal
          isOpen={showComposeModal}
          onClose={() => setShowComposeModal(false)}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}

// Helper function to format dates like Gmail
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

export default Dashboard;

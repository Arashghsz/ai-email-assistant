import React, { useState } from 'react';
import './ComposeModal.css';

function ComposeModal({ onSend, onClose }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend({ to, subject, message });
  };

  return (
    <div className="compose-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="compose-modal">
        <div className="compose-header">
          <h2>New Message</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="compose-form">
          <div className="compose-body">
            <input
              type="email"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              className="compose-input"
              autoFocus
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="compose-input"
            />
            <textarea
              placeholder="Compose email"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="compose-textarea"
            />
          </div>
          <div className="compose-actions">
            <button type="submit" className="send-btn">
              Send
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeModal;

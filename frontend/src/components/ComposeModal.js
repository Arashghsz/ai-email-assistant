import React, { useState } from 'react';
import './ComposeModal.css';

function ComposeModal({ isOpen, onClose, onSend }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiTitle, setAiTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSend({ to, subject, content });
      handleClose();
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleClose = () => {
    setTo('');
    setSubject('');
    setContent('');
    setAiTitle('');
    onClose();
  };

  const generateEmailWithAI = async () => {
    if (!aiTitle.trim()) {
      alert('Please enter a title for AI generation');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: aiTitle }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Set the subject to AI-generated title
        setSubject(data.title || ''); // Use AI-generated title for email subject
        setContent(data.content || '');
      } else {
        throw new Error(data.error || 'Failed to generate email');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('Failed to generate email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="compose-modal-overlay" onClick={handleClose}>
      <div className="compose-modal" onClick={e => e.stopPropagation()}>
        <div className="compose-header">
          <h2>New Message</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>

        {/* AI Generation Section */}
        <div className="ai-generation-section">
          <div className="ai-input-group">
            <label>Generate with AI</label>
            <div className="ai-input-wrapper">
              <input
                type="text"
                placeholder="Enter email topic..."
                value={aiTitle}
                onChange={(e) => setAiTitle(e.target.value)}
                className="ai-title-input"
              />
              <button 
                onClick={generateEmailWithAI}
                disabled={isLoading}
                className="ai-generate-btn"
              >
                {isLoading ? '⌛ Generating...' : '🤖 Generate'}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="compose-form">
          <div className="compose-fields">
            <input
              type="email"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              className="compose-input"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="compose-input"
            />
            <textarea
              placeholder="Email content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="compose-textarea"
            />
          </div>
          <div className="compose-actions">
            <button 
              type="button" 
              onClick={handleClose} 
              className="cancel-btn"
            >
              Discard
            </button>
            <button 
              type="submit" 
              className="send-btn"
              disabled={!to || !content}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeModal;

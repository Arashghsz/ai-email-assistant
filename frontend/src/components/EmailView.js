import React, { useState, useEffect } from 'react';
import './EmailView.css';

function EmailView({ email, onClose, onReply }) {
  const [showReply, setShowReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [parsedEmail, setParsedEmail] = useState({
    subject: '',
    from: '',
    to: '',
    date: '',
    content: '',
    attachments: []
  });

  useEffect(() => {
    if (email?.payload) {
      const headers = email.payload.headers || [];
      setParsedEmail({
        subject: getHeader(headers, 'subject'),
        from: getHeader(headers, 'from'),
        to: getHeader(headers, 'to'),
        date: new Date(getHeader(headers, 'date')).toLocaleString(),
        content: parseEmailContent(email.payload),
        attachments: getAttachments(email.payload)
      });
    }
  }, [email]);

  const getHeader = (headers, name) => {
    return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  };

  const parseEmailContent = (payload) => {
    if (payload.mimeType?.includes('text/html')) {
      return decodeContent(payload.body.data);
    }
    if (payload.parts) {
      const htmlPart = payload.parts.find(part => part.mimeType === 'text/html');
      const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
      return decodeContent((htmlPart || textPart)?.body?.data) || '';
    }
    return payload.body?.data ? decodeContent(payload.body.data) : '';
  };

  const getAttachments = (payload) => {
    const attachments = [];
    if (payload.parts) {
      payload.parts.forEach(part => {
        if (part.filename) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId
          });
        }
      });
    }
    return attachments;
  };

  const decodeContent = (data) => {
    if (!data) return '';
    return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
  };

  const handleReply = (e) => {
    e.preventDefault();
    const messageId = email.payload.headers.find(h => h.name === 'Message-ID')?.value;
    const references = email.payload.headers.find(h => h.name === 'References')?.value;
    
    const replyData = {
      to: parsedEmail.from,
      subject: `Re: ${parsedEmail.subject}`,
      message: replyMessage,
      threadId: email.threadId,
      messageId: messageId,
      references: references ? `${references} ${messageId}` : messageId
    };
    
    onReply(replyData);
    setShowReply(false);
  };

  const renderThreadMessages = () => {
    if (!email.threadMessages || email.threadMessages.length <= 1) return null;

    return (
      <div className="email-thread">
        <h3>Earlier messages</h3>
        {email.threadMessages.map((message, index) => (
          <div key={message.id} className="thread-message">
            {/* ...thread message rendering... */}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="email-view-overlay" onClick={onClose}>
      <div className="email-view" onClick={e => e.stopPropagation()}>
        <div className="email-view-header">
          <h2>{parsedEmail.subject}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="email-view-meta">
          <div className="meta-item">
            <span>From:</span> {parsedEmail.from}
          </div>
          <div className="meta-item">
            <span>To:</span> {parsedEmail.to}
          </div>
          <div className="meta-item">
            <span>Date:</span> {parsedEmail.date}
          </div>
        </div>

        <div className="email-view-content"
          dangerouslySetInnerHTML={{ __html: parsedEmail.content }}
        />

        {parsedEmail.attachments.length > 0 && (
          <div className="email-view-attachments">
            <h3>Attachments</h3>
            <div className="attachments-list">
              {parsedEmail.attachments.map((att, index) => (
                <div key={index} className="attachment-item">
                  <span>📎</span>
                  {att.filename} ({Math.round(att.size / 1024)}KB)
                </div>
              ))}
            </div>
          </div>
        )}

        {renderThreadMessages()}

        {!showReply ? (
          <div className="email-view-actions">
            <button 
              className="action-btn primary-btn"
              onClick={() => setShowReply(true)}
            >
              Reply
            </button>
            <button className="action-btn secondary-btn" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleReply} className="reply-form">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              className="reply-textarea"
              autoFocus
            />
            <div className="reply-actions">
              <button type="button" 
                className="reply-btn cancel"
                onClick={() => setShowReply(false)}
              >
                Discard
              </button>
              <button type="submit" className="reply-btn">
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EmailView;

import React from 'react';
import { AIService } from '../services/AIService';

function EmailList({ emails, onEmailClick, token }) {
  const renderPriorityBadge = (priority) => {
    const colors = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const renderTags = (tags) => (
    <div className="flex gap-1">
      {tags.map(tag => (
        <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
          {tag}
        </span>
      ))}
    </div>
  );

  const handleEmailClick = async (email) => {
    try {
      // Get AI analysis when email is clicked
      const analysis = await AIService.analyzeEmail(
        `Subject: ${email.subject}\n\n${email.snippet}`,
        token
      );
      
      // Add analysis to email object
      const emailWithAnalysis = {
        ...email,
        analysis
      };
      
      onEmailClick(emailWithAnalysis);
    } catch (error) {
      console.error('Failed to analyze email:', error);
      onEmailClick(email);
    }
  };

  return (
    <div className="email-list">
      {emails.map(email => (
        <div 
          key={email.id} 
          className={`email-item ${!email.isRead ? 'unread' : ''}`}
          onClick={() => handleEmailClick(email)}
        >
          <div className="email-checkbox">
            <input type="checkbox" onClick={e => e.stopPropagation()} />
          </div>
          <div className="email-sender">{email.from}</div>
          <div className="email-content-preview">
            <span className="email-subject">{email.subject}</span>
            <span className="email-separator">-</span>
            <span className="email-snippet">{email.snippet}</span>
          </div>
          {email.analysis && (
            <div className="email-analysis">
              {renderPriorityBadge(email.analysis.priority)}
              {renderTags(email.analysis.tags)}
            </div>
          )}
          <div className="email-date">{email.date}</div>
        </div>
      ))}
    </div>
  );
}

export default EmailList;

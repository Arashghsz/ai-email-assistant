# AI Email Assistant

🚀 An AI-powered email assistant that integrates with Gmail to provide real-time email tracking, smart AI-generated responses, and draft suggestions.

## Features

- 📧 **Smart Email Composition**: Generate professional emails using AI
- 💬 **Intelligent Reply Generation**: AI-powered contextual email replies
- 📱 **Real-time Notifications**: Get notified of new emails instantly
- 📊 **Email Tracking**: Track email status and reading receipts
- 🔄 **Auto-refresh**: Real-time email updates
- 🔍 **Smart Search**: Advanced email search capabilities
- 📝 **Draft Management**: Save and manage email drafts

## Tech Stack

- **Frontend**:
  - React.js
  - Context API for state management
  - Modern CSS with Flexbox/Grid
  - Real-time updates with polling

- **Backend**:
  - Node.js
  - Express.js
  - Groq API for AI integration
  - Gmail API integration

- **AI Features**:
  - Email generation with Groq
  - Smart reply suggestions
  - Context-aware responses

- **Architecture**:
  - Microservices architecture for scalability

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Gmail API credentials
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-email-assistant.git
cd ai-email-assistant
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../server
npm install

# Install AI service dependencies
cd ../ai-service
npm install
```

3. Set up environment variables:
```bash
# In /ai-service/.env
GROQ_API_KEY=your_groq_api_key
AI_SERVICE_PORT=3002

# In /frontend/.env
REACT_APP_API_URL=http://localhost:3002
```

### Running the Application

1. Start the AI service:
```bash
cd ai-service
npm start
```

2. Start the backend server:
```bash
cd server
npm start
```

3. Start the frontend:
```bash
cd frontend
npm start
```

## API Endpoints

### AI Service

- `POST /api/generate-email`
  - Generate new email content
  - Body: `{ title: string }`

- `POST /api/generate-reply`
  - Generate email reply
  - Body: `{ originalEmail: string, context?: string }`

### Email Service

- `GET /api/email/list`
  - Get list of emails
  - Requires authentication

- `POST /api/email/send`
  - Send new email
  - Requires authentication

- `POST /api/email/reply`
  - Send email reply
  - Requires authentication

## Component Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ComposeModal.js
│   │   ├── Dashboard.js
│   │   ├── EmailView.js
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── EmailService.js
│   └── ...
│
ai-service/
├── routes/
├── config/
├── server.js
└── ...

server/
├── auth-service/
├── email-service/
├── middleware/
├── postman/
├── server.js
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Groq API for AI capabilities
- Gmail API for email integration
- React community for awesome tools and libraries

## Contact

Arash Ghasemzadeh Kakroudi - [www.arashghsz.com](https://arashghsz.com)
Project Link: [https://github.com/arashghsz/ai-email-assistant](https://github.com/arashghsz/ai-email-assistant)

const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: config.groqApiKey,
});

app.post('/api/generate-email', async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || typeof title !== 'string') {
            return res.status(400).json({
                error: 'Invalid request: title is required and must be a string'
            });
        }

        const prompt = `Generate a professional email for the following title: "${title}"
            Requirements:
            1. The subject line must be:
               - Only contain the actual title (e.g., "Hello")
               - No analysis or thinking text
               - No special formatting or characters
               - No bullet points or dashes
            2. The email body should:
               - Use professional business language
               - Include a greeting
               - State the main message clearly
               - Have a professional closing and signature
            3. Format the response exactly as:
               SUBJECT: Hello
               BODY: [email content]`;

        console.log('Sending request to Groq API...');
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: config.model,
            ...config.apiOptions
        });

        const response = completion.choices[0]?.message?.content.trim() || '';
        
        // Parse and clean the response
        const parts = response.split('BODY:');
        const rawTitle = parts[0].replace('SUBJECT:', '').trim();
        
        // Extract only the last part after any thinking text
        const titleParts = rawTitle.split(/think|[-]/);
        const extractedTitle = titleParts[titleParts.length - 1]
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, ''); // Remove any special characters

        const extractedBody = parts[1]?.trim() || '';

        res.json({ 
            title: extractedTitle,
            content: extractedBody,
            status: 'success'
        });
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate email',
            details: error.message
        });
    }
});

app.listen(config.port, () => {
    console.log(`AI Email Service running on http://localhost:${config.port}`);
});

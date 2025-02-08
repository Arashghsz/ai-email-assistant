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
            1. Use professional business language
            2. Keep it concise and clear
            3. Include:
               - Professional greeting
               - Main content
               - Professional closing
               - Signature
            4. Format it ready to paste into an email client
            5. Don't include email headers (To:, From:, etc.)`;

        console.log('Sending request to Groq API...');
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: config.model,
            ...config.apiOptions
        });

        const generatedEmail = completion.choices[0]?.message?.content.trim() || '';
        console.log('Email generated successfully');
        
        res.json({ 
            title: title,
            content: generatedEmail,
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

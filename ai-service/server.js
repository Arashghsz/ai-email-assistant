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
               - Only contain the actual title
               - No analysis or thinking text
               - No special formatting or characters
               - No bullet points or dashes
               - Only the title text
            2. The email body should:
               - Use professional business language
               - Include a greeting
               - State the main message clearly
               - Have a professional closing and signature
            3. Format the response exactly as:
               SUBJECT: [Genereated Subject]
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

// Add new endpoint for generating email replies
app.post('/api/generate-reply', async (req, res) => {
    try {
        const { originalEmail, context } = req.body;

        if (!originalEmail) {
            return res.status(400).json({
                error: 'Invalid request: original email content is required'
            });
        }

        const prompt = `Generate a complete professional email reply:

            ORIGINAL EMAIL: "${originalEmail}"
            ${context ? `CONTEXT: "${context}"` : ''}

            REQUIREMENTS:
            1. Must be a complete, uncut response
            2. Include full greeting (Dear/Hello [Name])
            3. Write a complete body with full sentences
            4. Include proper closing with signature
            5. No placeholders like [Your name]
            6. No abbreviations or cut-off sentences
            7. Minimum length: 3 sentences
            8. Maximum length: 10 sentences

            EXAMPLE FORMAT:
            Dear [Actual Name],

            [2-3 sentences acknowledging and addressing the email]
            [1-2 sentences providing next steps or conclusion]

            Best regards,
            [Actual name or position]`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: config.model,
            temperature: 0.3,
            max_tokens: 500,
            top_p: 0.5,
        });

        let generatedReply = completion.choices[0]?.message?.content.trim() || '';

        // Validate response completeness
        const hasGreeting = /^(Dear|Hello|Hi)\s+\w+/i.test(generatedReply);
        const hasClosing = /(Best|Kind|Sincerely|Regards|Thanks|Thank you|Yours)[, ]+(regards|sincerely|truly)/i.test(generatedReply);
        const hasContent = generatedReply.split('\n\n').length >= 2;
        
        if (!hasGreeting || !hasClosing || !hasContent || generatedReply.includes('[Your name]')) {
            // If validation fails, generate a properly structured response
            generatedReply = `Dear ${context ? context.split(' ')[0] : 'Valued Customer'},

I appreciate your message and will respond with a more detailed reply soon. I want to ensure I provide you with the most helpful and complete response possible.

Best regards,
Customer Service Team`;
        }

        res.json({ 
            content: generatedReply,
            status: 'success'
        });
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({
            error: 'Failed to generate reply',
            details: error.message
        });
    }
});

app.listen(config.port, () => {
    console.log(`AI Email Service running on http://localhost:${config.port}`);
});

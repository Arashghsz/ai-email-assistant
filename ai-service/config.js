require('dotenv').config();

module.exports = {
    port: process.env.AI_SERVICE_PORT || 3002,
    groqApiKey: process.env.GROQ_API_KEY,
    model: 'deepseek-r1-distill-llama-70b',
    apiOptions: {
        temperature: 0.3,
        max_tokens: 2048,
        top_p: 0.8,
    }
};

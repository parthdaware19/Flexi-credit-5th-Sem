require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'flexi_credit_super_secret_jwt_key_2026_xai_tavily',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROK_API_KEY: process.env.GROK_API_KEY || '',
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  GROK_API_URL: 'https://api.x.ai/v1/chat/completions',
  TAVILY_API_URL: 'https://api.tavily.com/search'
};

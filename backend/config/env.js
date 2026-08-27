import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  groqKey: process.env.GROQ_API_KEY || '',
  geminiKey: process.env.GEMINI_API_KEY || '',
  nvidiaKey: process.env.NVIDIA_API_KEY || '',
  hfKey: process.env.HF_API_KEY || '',
  githubToken: process.env.GITHUB_TOKEN || '',
  githubOwner: process.env.GITHUB_REPO_OWNER || 'theflaxyplays-dotcom',
  githubRepo: process.env.GITHUB_REPO_NAME || 'lumina-ai',
  tavilyKey: process.env.TAVILY_API_KEY || '',
  spotifyToken: process.env.SPOTIFY_ACCESS_TOKEN || '',
  weatherKey: process.env.OPEN_WEATHER_API_KEY || '',
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '5913627317',
  driveModelUrl: process.env.DRIVE_MODEL_URL || ''
};

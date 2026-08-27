import axios from 'axios';
import { config } from '../config/env.js';

export async function sendTelegramNotification(message) {
  if (!config.telegramToken || !config.telegramChatId) return;
  try {
    await axios.post(`https://api.telegram.org/bot${config.telegramToken}/sendMessage`, {
      chat_id: config.telegramChatId,
      text: `🤖 [Lumina Sentinel]: ${message}`
    });
  } catch (e) {}
}

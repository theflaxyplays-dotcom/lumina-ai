import axios from 'axios';
import { config } from '../config/env.js';

export async function tavilySearch(query) {
  if (!config.tavilyKey) return [];
  try {
    const res = await axios.post('https://api.tavily.com/search', {
      api_key: config.tavilyKey,
      query,
      search_depth: 'basic',
      max_results: 3
    });
    return res.data.results || [];
  } catch (e) {
    return [];
  }
}

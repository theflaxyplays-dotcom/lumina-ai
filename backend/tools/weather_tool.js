import axios from 'axios';
import { config } from '../config/env.js';

export async function getLiveWeather(city = 'Bhopal') {
  if (!config.weatherKey) return { temp: 32, condition: 'Clear' };
  try {
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${config.weatherKey}`);
    return { temp: res.data.main.temp, condition: res.data.weather[0].description };
  } catch (e) {
    return { temp: 30, condition: 'Pleasant' };
  }
}

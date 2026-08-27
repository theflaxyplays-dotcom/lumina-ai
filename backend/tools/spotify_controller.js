import axios from 'axios';
import { config } from '../config/env.js';

export class SpotifyController {
  async searchAndPlay(query) {
    if (!config.spotifyToken) return { status: 'Spotify token missing' };
    try {
      const res = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
        headers: { Authorization: `Bearer ${config.spotifyToken}` }
      });
      const track = res.data.tracks.items[0];
      return { status: 'Playing track', name: track.name, artist: track.artists[0].name };
    } catch (e) {
      return { status: 'Spotify search failed', error: e.message };
    }
  }
}

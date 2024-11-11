require('dotenv').config();

// Spotify API
const axios = require('axios');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;


//Get the spotify access token
const getAccessToken = async () => {
    const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const encodedAuthString = Buffer.from(authString).toString('base64');
  
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${encodedAuthString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  };

async function getTopArtists() {
    // Use the global top 50 playlist
    const playlistId = '37i9dQZEVXbMDoHDwVN2tF';  // Spotify's Top 50 Global Playlist
    const accessToken = await getAccessToken();  // Replace with your actual access token
    
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
  
      // Get the artists from the playlist tracks
      const artists = response.data.items.map(track => track.track.artists.map(artist => artist.name));
      
      return artists;
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  }


  module.exports = getTopArtists;
  
require('dotenv').config();

// Spotify API
const axios = require('axios');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

//Schema 
const Artist = require('./Schemas/ArtistSchema');

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

async function populateArtistById(artistId) {
  const access_token = await getAccessToken();  // Retrieve a valid access token

  try {
    // Fetch artist data from Spotify
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    // Extract relevant data from Spotify's response
    const artistData = response.data;

    // Define the artist document based on ArtistSchema
    const artistDoc = {
      artist_name: artistData.name,
      spotify_id: artistData.id,
      ticket_info: {
        num_tickets_available: 1000, // default values
        ticket_price: 1
      },
      popularity: 10,
    };

    // Insert the artist into the database, or update if they already exist
    const savedArtist = await Artist.findOneAndUpdate(
      { spotify_id: artistData.id },  // Match by Spotify ID to avoid duplicates
      artistDoc,
      { upsert: true, new: true }     // Create if not exists, return the new document
    );

    console.log('Artist saved or updated in database:', savedArtist);
    return savedArtist;
  } catch (error) {
    console.error('Error populating artist in database:', error);
  }
}

async function getArtistIDs() {
    const playlistId = '37i9dQZEVXbMDoHDwVN2tF';
    const access_token = await getAccessToken();

    try {
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
            },
          }
        );
        
        // Get the artists from the playlist tracks
        // const data = response.data.items.map(track => track.track.artists);
        const artistIds = response.data.items.flatMap(track => 
            track.track.artists.map(artist => artist.id)
          );
        console.log(artistIds);

        for (let i = 0; i < artistIds.length; i++) {
            populateArtistById(artistIds[i]);
        }
        return response.data;
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
}




  getArtistIDs();
  module.exports = getTopArtists;
  
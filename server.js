require('dotenv').config();

// Database/server init
const User = require('./Schemas/UserSchema');
const express = require('express');
const mongoose = require('mongoose');

// The code that will run the server
const app = express();
app.use(express.json());

// Networking
const PORT = process.env.PORT || 5555;
const uri = process.env.MONGODB_URI;

// Spotify file
const spot = require('./getartists');
const getTopArtists = require('./getartists');
const getArtists = require('./getartists');

// Connect to the DB cloud 
mongoose.connect(uri, {})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB:', err));

// Route to register a new user
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
      // Create a new user instance with the request data
      const newUser = new User({ username, email, password });
      
      // Save the new user to the database
      await newUser.save();
      
      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      res.status(400).json({ error: 'Error registering user' });
  }
});

app.get('/ping', async (req, res) => {
  console.log("Ping received");
  res.send("Pong");
})

app.get('/home', async (req, res) => {
  res.send("Welcome to the future of music");
})

app.get('/display', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Check if users are found
    if (users.length === 0) {
      return res.status(404).send('No users found');
    }

    // Send the users as JSON response
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching users');
  }
})

async function displayArtists() {
  const artists = await getTopArtists();
  return artists;
}  

app.get('/artists', (req, res) => {
  displayArtists()
    .then(artists => {
      res.send(artists);  // Send the resolved artists data to the client
    })
    .catch(error => {
      res.status(500).send('Error fetching artists');
    });
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
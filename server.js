require('dotenv').config();

// Database/server init
const User = require('./Schemas/UserSchema');
const Artist = require('./Schemas/ArtistSchema');
const express = require('express');
const mongoose = require('mongoose');

// The code that will run the server
const app = express();
app.use(express.json());
// Serve static files from the 'public' folder
app.use(express.static('public'));
// Display
app.set('view engine', 'ejs');

// Networking
const PORT = process.env.PORT || 5555;
const uri = process.env.MONGODB_URI;


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

// Ping the application to see if its up
app.get('/ping', async (req, res) => {
  console.log("Ping received");
  res.send("Pong");
})

// Home page 
app.get('/home', async (req, res) => {
  res.send("Welcome to the future of music");
})

// Display all the users in the database
app.get('/users', async (req, res) => {
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


// Artists page
app.get('/artists', async (req, res) => {
  const { search, sort, order, page = 1 } = req.query;

  const limit = 15; // Number of artists per page
  const skip = (page - 1) * limit; // Skip artists based on the page number

  const query = {};
  if (search) {
    query.artist_name = { $regex: search, $options: 'i' }; // Case-insensitive search
  }

  const sortBy = sort || 'artist_name';
  const sortOrder = order === 'desc' ? -1 : 1;

  try {
    // Get artists from the database with search, sort, and pagination
    const artists = await Artist.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the total count of artists for pagination
    const totalArtists = await Artist.countDocuments(query);
    const totalPages = Math.ceil(totalArtists / limit);

    res.render('artists', {
      artists,
      searchQuery: search || '',
      sortBy,
      sortOrder,
      page: parseInt(page),
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).send('Server Error');
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
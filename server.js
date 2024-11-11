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
app.use(express.urlencoded({ extended: true }));  // This ensures form data is parsed


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

/////////////////////////////////////////////// DISPLAY USERS PAGE ///////////////////////////////////////////////

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

/////////////////////////////////////////////// ARTISTS PAGE ///////////////////////////////////////////////

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

/////////////////////////////////////////////// BUY/SELL PAGES ///////////////////////////////////////////////

// Buy a share
app.post('/artists/buy', async (req, res) => {
  const artistId = req.body.artistId;
  console.log(artistId);
  try {
    // Find the artist in the database
    const artist = await Artist.findById(artistId);
    
    if (!artist) {
      return res.status(404).send('Artist not found');
    }

    // Check if tickets are available
    if (artist.ticket_info.num_tickets_available > 0) {
      // Decrease the number of available tickets
      artist.ticket_info.num_tickets_available -= 1;

      // Save the updated artist document
      await artist.save();

      res.send(`<h2>Successfully bought a ticket for ${artist.artist_name}!</h2>`);
    } else {
      res.send('<h2>No tickets available to buy!</h2>');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the buy request');
  }
});

// Sell route
app.post('/artists/sell', async (req, res) => {
  const artistId = req.body.artistId;

  try {
    // Find the artist in the database
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).send('Artist not found');
    }

    // Increase the number of available tickets
    artist.ticket_info.num_tickets_available += 1;

    // Save the updated artist document
    await artist.save();

    res.send(`<h2>Successfully sold a ticket for ${artist.artist_name}!</h2>`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the sell request');
  }
});

/////////////////////////////////////////////// LOGIN PAGES ///////////////////////////////////////////////
// Render login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      // If no user is found, pass an error to the template
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Compare the entered password with the stored password
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      // Redirect to artists page upon successful login
      res.redirect('/artists');
    } else {
      // If the password is incorrect, pass an error to the template
      res.render('login', { error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'An error occurred. Please try again.' });
  }
});

/////////////////////////////////////////////// SIGNUP PAGES ///////////////////////////////////////////////
// Render signup page
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('signup', { error: 'Username already taken' });
    }

    // Create new user
    const newUser = new User({
      username,
      password,
      email,
    });

    await newUser.save();
    res.redirect('/login'); // Redirect to login page after successful signup
  } catch (error) {
    console.error(error);
    res.render('signup', { error: 'Error during signup, please try again' });
  }
});


/////////////////////////////////////////////// HOME PAGES ///////////////////////////////////////////////
app.get('/home', (req, res) => {
  res.render('home');
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
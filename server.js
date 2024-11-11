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

const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // For non-HTTPS (ensure this is true for production HTTPS)
}));

// Networking
const PORT = process.env.PORT || 5555;
const uri = process.env.MONGODB_URI;


// Connect to the DB cloud 
mongoose.connect(uri, {})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB:', err));

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login'); // Redirect to login if not authenticated
}

// Profile route to display user data
// In the profile route
app.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }

  try {
    const user = await User.findById(req.session.userId)
      .populate('tickets.artistId')  // Populate artist data
      .select('username email tickets balance');

    if (!user) {
      return res.redirect('/login');
    }

    res.render('profile', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Deposit money route
app.post('/profile/deposit', isAuthenticated, async (req, res) => {
  const { amount } = req.body;
  try {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).send("Invalid deposit amount.");
    }

    const user = await User.findByIdAndUpdate(req.session.userId, {
      $inc: { balance: depositAmount },
    }, { new: true }); // Make sure we return the updated user

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Update session user data
    req.session.user = user; // Ensure the session is updated
    res.redirect('/profile'); // Redirect back to the profile page
  } catch (error) {
    console.error("Error updating balance:", error);
    res.redirect('/profile');
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

app.post('/artists/buy', async (req, res) => {
  const artistId = req.body.artistId;
  const userId = req.session.userId;

  try {
    // Find the artist
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).send('Artist not found');
    }

    const ticketPrice = artist.ticket_info.ticket_price;
    // Check if tickets are available
    if (artist.ticket_info.num_tickets_available <= 0) {
      return res.send('<h2>No tickets available to buy!</h2>');
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check if user has enough balance
    if (user.balance < ticketPrice) {
      return res.send('<h2>You do not have enough balance to buy this ticket!</h2>');
    }

    // Deduct the balance from the user
    user.balance -= ticketPrice;

    // Add the ticket to the user's collection (if the ticket already exists, increment the quantity)
    const ticketIndex = user.tickets.findIndex(ticket => ticket.artistId.toString() === artistId);
    if (ticketIndex !== -1) {
      // Update the existing ticket quantity
      user.tickets[ticketIndex].quantity += 1;
    } else {
      // Add new ticket
      user.tickets.push({ artistId: artistId, quantity: 1 });
    }

    // Save the user document
    await user.save();

    // Decrease the number of tickets available for the artist
    artist.ticket_info.num_tickets_available -= 1;
    await artist.save();

    res.send(`<h2>Successfully bought a ticket for ${artist.artist_name}!</h2>`);
  } catch (error) {
    console.error('Error buying ticket:', error);
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

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      req.session.userId = user._id; // Store user ID in session
      req.session.user = user; // Store user object in session
      res.redirect('/profile');
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'An error occurred. Please try again.' });
  }
});

/////////////////////////////////////////////// LOGOUT PAGE ///////////////////////////////////////////////

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
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

// Redirect root '/' to '/home'
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
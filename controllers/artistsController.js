// controllers/artistController.js
const Artist = require('../models/ArtistModel');
const User = require('../models/UserModel');

// Render artists page
exports.artistsPage = async (req, res) => {
  const { search, sort, order, page = 1 } = req.query;
  const limit = 15;
  const skip = (page - 1) * limit;
  
  const query = {};
  if (search) query.artist_name = { $regex: search, $options: 'i' };

  const sortBy = sort || 'artist_name';
  const sortOrder = order === 'desc' ? -1 : 1;

  try {
    const artists = await Artist.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalArtists = await Artist.countDocuments(query);
    const totalPages = Math.ceil(totalArtists / limit);

    res.render('artists', {
      artists,
      searchQuery: search || '',
      sortBy,
      sortOrder,
      page: parseInt(page),
      totalPages,
      activePage: 'artists',
      title: 'artists',
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).send('Server Error');
  }
};

// Buy a ticket
exports.buyTicket = async (req, res) => {
  const { artistId } = req.body;
  const userId = req.session.userId;

  try {
    const artist = await Artist.findById(artistId);
    const user = await User.findById(userId);

    if (!artist) return res.status(404).send('Artist not found');
    if (!user) return res.redirect('/auth/login');

    const ticketPrice = artist.ticket_info.ticket_price;
    if (artist.ticket_info.num_tickets_available <= 0) return res.send('<h2>No tickets available to buy!</h2>');

    if (user.balance < ticketPrice) return res.send('<h2>You do not have enough balance to buy this ticket!</h2>');

    user.balance -= ticketPrice;
    const ticketIndex = user.tickets.findIndex(ticket => ticket.artistId.toString() === artistId);

    if (ticketIndex !== -1) {
      user.tickets[ticketIndex].quantity += 1;
    } else {
      user.tickets.push({ artistId, quantity: 1 });
    }

    await user.save();
    artist.ticket_info.num_tickets_available -= 1;
    await artist.save();

    res.send(`<h2>Successfully bought a ticket for ${artist.artist_name}!</h2>`);
  } catch (error) {
    console.error('Error buying ticket:', error);
    res.status(500).send('Error processing the buy request');
  }
};

// Sell a ticket
exports.sellTicket = async (req, res) => {
  const { artistId } = req.body;
  const userId = req.session.userId;
  try {
    const artist = await Artist.findById(artistId);
    const user = await User.findById(userId);

    if (!artist) return res.status(404).send('Artist not found');
    if (!user) return res.redirect('/auth/login');

    const ticketPrice = artist.ticket_info.ticket_price;

    // Check to see if the user has a ticket
    const userTicket = user.tickets.find(ticket => ticket.artistId.toString() === artistId.toString());

    if (!userTicket) {
      return res.status(400).send('You do not have a ticket for this artist');
    }

    // Check if the user has more than one ticket for the artist
    if (userTicket.quantity > 1) {
      // If the user has more than one ticket, just decrease the quantity by 1
      console.log("removing ticket")
      userTicket.quantity -= 1;
      res.send(`<h2>You have successfully sold a ${artist.artist_name} ticket!</h2><h3>Remaining tickets: ${userTicket.quantity}`);
    } else {
      // If the user only has one ticket, remove it completely from the array
      user.tickets = user.tickets.filter(ticket => ticket.artistId.toString() !== artistId.toString());
      res.send(`<h2>You have sold your final ${artist.artist_name} ticket!</h2>`);
    }

    // Increase the number of available tickets for the artist
    artist.ticket_info.num_tickets_available += 1;

    user.balance += ticketPrice;

    // Save the updated user and artist data
    await user.save();
    await artist.save();

    
  } catch (error) {
    console.error('Error buying ticket:', error);
    res.status(500).send('Error processing the buy request');
  }

};

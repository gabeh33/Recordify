// File where people can see other users, artists they might like, fyp type vibe
const { default: axios } = require('axios');
const User = require('../models/UserModel')

exports.socialPage = async (req, res) => {
    try {
        // Fetch all users except the current user (if you have req.session.userId)
        const users = await User.find({ _id: { $ne: req.session.userId } });

        // Add a field `isFriend` to each user based on your logic (e.g., if they’re already friends with the current user)
        const updatedUsers = users.map(user => ({
            ...user.toObject(), // Convert Mongoose document to plain object
            isFriend: user.friends && user.friends.includes(req.session.userId) // Replace this with actual logic
        }));
        // Render the EJS file, passing the `users` array
        res.render('addFriends', { users: updatedUsers, title: 'Social Page', activePage: 'social' });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
};

exports.newsPage = async (req, res) => {
    try {
    const userID = req.session.userId;
    if (!userID) {
        console.log("User not logged in");
        res.render('news', { articles: [], title:'News', activePage:'social' });
    }
    // Find the user and populate the `artistId` field in tickets with the artist details
    const user = await User.findById(userID).populate('tickets.artistId', 'artist_name');
    const artistNames = user.tickets.map(ticket => ticket.artistId.artist_name);

    // Fetch news articles for the given artist
    const articles = await fetchArtistNews(artistNames);

    // Render the EJS template with the data
    res.render('news', {articles, title:'News', activePage:'social' });
    
    } catch (error) {
        console.error(`Error in newsPage: ${error.message}`);
        res.status(500).send('Unable to load news page at the moment.');
    }
}

const fetchArtistNews = async (artists) => {
    const apiKey = process.env.NEWS_KEY;
    const url = `https://newsapi.org/v2/everything`;
    total_articles = [];
     artists.forEach(async (artist) => {
        try {
            const response = await axios.get(url, {
                params: {
                    q: artist,
                    apiKey: apiKey,
                    sortBy: 'relevance',
                },
            });
        artist_articles = response.data.articles.filter((article) => {
            const title = article['title'] ? article['title'].toLowerCase().trim() : '';
            const artist = artistName.toLowerCase().trim();
            console.log(title);
            return title.includes(artist); // Only include articles where the artist name is in the title 
        });
        console.log(`News for ${artistName}:`, articles)
        total_articles.push(artist_articles);
        } catch (error) {
            console.error(`Failed to fetch news for ${artistName}:`, error);
            return [];
        }
    });
    return total_articles;
};
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

        fetchArtistNews('Noah Kahan').then((articles) => {
            articles.forEach((article, index) => {
                console.log(`${index + 1}. ${article.title} - ${article.source.name}`);
            });
        });
        // Render the EJS file, passing the `users` array
        res.render('addFriends', { users: updatedUsers, title: 'Social Page', activePage: 'social' });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
};

exports.newsPage = async (req, res) => {
    // const artistName = req.params.artist; // Extract artist name from URL parameter
    const artistName = 'Noah Kahan';
    try {
        // Fetch news articles for the given artist
        const articles = await fetchArtistNews(artistName);

        // Render the EJS template with the data
        res.render('news', { artistName, articles, title:'News', activePage:'social' });
    } catch (error) {
        console.error(`Error in newsPage: ${error.message}`);
        res.status(500).send('Unable to load news page at the moment.');
    }
}

const fetchArtistNews = async (artistName) => {
    const apiKey = process.env.NEWS_KEY;
    const url = `https://newsapi.org/v2/everything`;

    try {
        const response = await axios.get(url, {
            params: {
                q: artistName,
                apiKey: apiKey,
                sortBy: 'relevance',
            },
        });
    
    console.log(`News for ${artistName}:`, response.data.articles)
    return response.data.articles;
    } catch (error) {
        console.error(`Failed to fetch news for ${artistName}:`, error);
        return [];
    }
};
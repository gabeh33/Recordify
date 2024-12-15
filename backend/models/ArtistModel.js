// models/ArtistSchema.js
const mongoose = require('mongoose');

const ticketInfoSchema = new mongoose.Schema({
    num_tickets_available: {
        type: Number, 
        required: true, 
        default: 1000
    }, 

    ticket_price: { 
        type: Number, 
        required: true, 
        default:1 
    }
})
const artistSchema = new mongoose.Schema({
    artist_name: { 
        type: String, 
        required: true, 
        unique: true },

    spotify_id: { 
        type: String, 
        required: true, 
        unique: true },

    ticket_info: { 
        type: ticketInfoSchema, 
        required: true, 
        default: () => ({})},

    popularity: {
        type: Number, 
        required: true, 
        default: 5
    }
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./User')
const ObjectId =Schema.ObjectId;
const profileSchema = mongoose.Schema({
    username : String,
    contact : Number,
    address: String,
    landmark : String,
    zip : Number,
    city: String,
    state: String,
    user: [{ type:ObjectId , ref: 'users'}],
});
module.exports = mongoose.model('Profile' , profileSchema)
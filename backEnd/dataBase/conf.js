const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/ecommerce');
require('dotenv').config(); // Load environment variables from .env file
require("dotenv").config({ path: "config/config.env" });

// console.log(`${process.env.MONGO_DB_PORT}`, 'mongodb connect')
mongoose.connect(`${process.env.MONGO_DB_PORT}`); 
// const connectionString = process.env.MONGO_DB_PORT;
// const connectionString1 = process.env.CLOUD_NAME;

// console.log(process.env, 'mongo connection')
// console.log(connectionString1, 'mongo connection1')
// console.log(process.env.SECRET_KEY, 'secret_key')
 
// mongoose.connect(connectionString);



const cloudinary = require("cloudinary").v2;

          
cloudinary.config({ 
  cloud_name:process.env.CLOUD_NAME, 
  api_key:process.env.API_KEY, 
  api_secret:process.env.API_SECRET 
});
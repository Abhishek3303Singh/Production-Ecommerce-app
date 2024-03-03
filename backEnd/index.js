const express = require('express')
const app = express()
require("./dataBase/conf");
const UserModel = require('./dataBase/User')
const ProfileModel = require('./dataBase/Profile')
// const ProductModels = require('./dataBase/product/Product')
const cors = require('cors');
const { findOne } = require('./dataBase/User');
const bcrypt = require('bcrypt')
const secretKey = "ABHISHEKSINGHSINGLEANDILOVE"
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const cloudinary = require('cloudinary')
const path = require('path')




// const conDB = async ()=>{
//     mongoose.connect('mongodb://localhost:27017/ecommerce')
// }
// app.use(express.json())

// dotenv.config({ path: 'backEnd/dataBase/config/config.env' });
require("dotenv").config({ path: "config/config.env" });
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload());

cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME, 
    api_key:process.env.API_KEY, 
    api_secret:process.env.API_SECRET 
  });
// Middleware for token
app.post('/api/v1/profile', (req, res, next)=>{
        const token = req.headers.authorization;
    console.log(token)
    if(token){
        // check token
        jwt.verify(token, secretKey, function(err, decode) {
            if(err){
                return res.status(403).json({
                    status:"failed",
                    message:"The token has been expired"
                })
            }            
             // bar
             console.log(decode)
            req.user = decode.data
            next()
          });
    }
    else{
        res.status(403).json({
            status:'failed',
            message:"user is not Authenticated"
        })
    }   
   
})

///////////////////////////   route/////////////////////////////
const productEnv = require('./routes/ProductRoute')
app.use('/api/v1', productEnv)
////////////////////////////////////////////////////////

//// user Route////////////////
const userRoute = require('./routes/userRouts')
app.use('/api/v1', userRoute)

/////Order route/////
const orderRoute = require('./routes/orderRoute')
app.use('/api/v1', orderRoute)

/// Payment Route
const payment = require('./routes/paymentRoute')
app.use('/api/v1',payment)


/// Banner Route
const banner = require('./routes/banner')
app.use('/api/v1/', banner)

app.use(express.static(path.join(__dirname, '../frontEnd/ecom-app/build')))
app.get('*',(req, res)=>{
    res.sendFile(path.resolve(__dirname, '../frontEnd/ecom-app/build/index.html'))

})

//////////////// Handling uncaught Exception///////////
process.on('uncaughtException', (err)=>{
    console.log(`Error=> ${err.message}`);
    console.log('shutting down server due to uncaught err!!')
    process.exit(1)    
})
////////////////////////////////////////////////





// Admin Api or  Route
// app.post('/add-product', async (req, res) => {
//     try {
//         const product = new ProductModels(req.body);
//         const response = await product.save();
//         res.status(200).json({
//             status:'success',
//             response
//         })

//     }catch(e){
//         res.status(400).json({
//             status:'failed',
//             message:e.message
//         })
//     }
    
// })
// app.get('/products', async (req, res)=>{
//     try{
//         let allProducts = await ProductModels.find();
//         res.status(200).json({
//             status:"success",
//             allProducts
//         })
//     }catch(e){
//         res.status(400).json({
//             status:"failed",
//             message: e.message
//         })
//     }

// })



/// listining port
let server = app.listen(process.env.PORT, () => {
    console.log(`Server is up on ${process.env.PORT} port`)
})

// Unhandled Promise Rejection
process.on('unhandledRejection', (err)=>{
    console.log(`Error=> ${err.message}`);
    console.log('shutting down server!!')
    server.close(()=>{
        process.exit(1)
    })
})
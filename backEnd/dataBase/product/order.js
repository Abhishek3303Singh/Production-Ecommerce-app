const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    shippingAddress:{
        name:{type:String, required:true},
        address:{type:String, required:true},
        city:{type:String, required:true},
        instate:{type:String, required:true},
        pincode:{type:Number, required:true},
        landmark:{type:String, required:true},
        country:{type:String, required:true, default:"India"},
        phoneNo:{type:Number, required:true},
        
        
    },
    orderProduct:  [
        {
            product:{type:mongoose.Schema.ObjectId, ref:"products", required:true},
            name:{type:String, required:true},
            price:{type:String, required:true},
            offerPrice:{type:String, required:true},
            image:{type:String, required:true},
            stock:{type:String},
            title:{type:String},
            quantity:{type:String, required:true},         
             
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"users",
        required:true
    },
    paymentInformation:{
        id:{type:String, required:true},
        status:{type:String, required:true},       
    },
    paidAtDate:{type:Date, required:true},
    productPrice:{type:Number, require:true},
    vatPrice:{type:Number, required:true},
    shippingPrice:{type:Number, required:true, default:0},
    totalPrice:{type:Number, required:true, default:0},
    orderStatus:{type:String, required:true, default:"In process"},
    deliveredDate:{type:Date, required:true, default:Date.now()}
})
module.exports = mongoose.model('Order', orderSchema)
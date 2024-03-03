const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    title:{
        type:String,
        require:[true, 'Please Enter The Productg Title']
    },
    name:{
        type: String,
        required:[true, "Please Enter Product  Name"]
    },
    brand:{
        type: String,
        required:[true, "Please Enter Brand Name"]
    },
    category:{
        type:String,
        required:[true, "Please Add Product Category"]
    },

    price:{
        type:Number,
        required:[true]
    },
    offerPrice:{
        type:Number,
        required:[true]
    },
    Image:[
        {
            public_id:{
                type: String,
                required: true
            },
            url:{
                type: String,
                require: true
            }
        }
    ],
  
    description:{
        type: String,
        required:[true, "Please Add Product description."]
    },
    Stock:{
        type: Number,
        required:[true],
        maxLength:[3],
        default: 1
    },
    ratings:{
        type:Number,
        default :5
    },
    reviewsCount:{
        type: Number,
        default: 0
    },
    customerReview:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"users",
                require:true
            },  
            name:{
                type: String,
                // required: true
            },

            rating:{
                type:Number,
                
            },
            feedback:{
                type: String,

            }
        },
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"users",
        require:true
    },              

    createdAt:{
        type :Date,
        default: Date.now()
    }
    // userId: String,
    // password:String
});
module.exports = mongoose.model("products", productSchema)
const mongoose = require('mongoose');
const bannrSchema = mongoose.Schema({
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
module.exports = mongoose.model("banner", bannrSchema)
const mongoose = require("mongoose");
// const {resetTokengen}= require('../routeResponse/userAuth')
const userAuth = "../routeResponse/userAuth";
const crypto = require("crypto");
const secretKey = process.env.SECRET_KEY
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema;
// const {forgotPassword} = ('../route')
const userSchema = mongoose.Schema({
  email: {
    type:String,
    required:true,
    unique:true,
    lowercase:true
  },

  name: {
    type:String,
    required:true
  },
  phone: {
    type:String
  },
  password: {
  type: String,
  select: false,
  required: function () {
    return this.provider === "local";
  }
},
  ProfilePic: {
    public_id: String,
    url: String
  },
  provider:{
    type:String,
    enum:['local', 'google'],
    default:'local'
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt:{
    type:Date,
    default:Date.now
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign(
    { id: this._id }, // This creates { id: "user_id" }
    secretKey,
    { expiresIn: '7d' } 
  );
};

userSchema.methods.getresetPassordtoken = function () {
  // generating token
  const newToken = crypto.randomBytes(20).toString("hex");
  /// Hashing
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(newToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return newToken;
};
// const users = mongoose.model("users", userSchema);

module.exports = mongoose.model("users", userSchema);

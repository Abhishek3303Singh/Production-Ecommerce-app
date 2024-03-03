const mongoose = require("mongoose");
// const {resetTokengen}= require('../routeResponse/userAuth')
const userAuth = "../routeResponse/userAuth";
const crypto = require("crypto");
// const secretKey = "ABHISHEKSINGHSINGLE";
const secreate = process.env.SECRET_KEY
const jwt = require('jsonwebtoken')
const bcrypt =require('bcrypt')
const Schema = mongoose.Schema;
// const {forgotPassword} = ('../route')
const userSchema = mongoose.Schema({
  email: String,
  name: String,
  phone: Number,
  password: {
    type: String,
    // select: false,
  },
  ProfilePic: {
    public_id: {
      type: String,
      // required: true,
    },
    url: {
      type: String,
      // require: true,
    },
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
  return jwt.sign({ id: this._id }, secretKey, {
    expiresIn: Math.floor(Date.now() / 1000) + 60 * 60,
  });
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

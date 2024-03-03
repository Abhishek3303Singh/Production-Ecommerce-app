const BannerModels = require("../dataBase/banner");
require("../dataBase/conf");
const catchError = require("../middleware/asyncError");
const Featurs = require("../utils/featurs");
// const cloudinary = require('cloudinary')
const cloudinary = require("cloudinary");

exports.AddBanner = async (req, res) => {
  try {
    let images = [];
    // console.log(typeof req.body.Image, 'Image-Type!!')
    if (typeof req.body.Image === "string") {
      images.push(req.body.Image);
    } else {
      images = req.body.Image;
    }

    const imageLinks = [];
    for (let i = 0; i < images.length; i++) {
      // console.log(images[i], 'images')
      const resData = await cloudinary.v2.uploader.upload(images[i], {
        // upload_preset:'FunHub',
        folder: "Banner",
      });

      // console.log(resData, 'resData')
      imageLinks.push({
        public_id: resData.public_id,
        url: resData.secure_url,
      });
    }
    req.body.Image = imageLinks;

    req.body.user = req.user.id;
    const banners = new BannerModels(req.body);
    const response = await banners.save();
    res.status(200).json({
      status: "success",
      response,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};


// Get All BAnner
exports.getBanner = async(req, res)=>{
    try{
        const banners = await BannerModels.find()
        res.status(200).json({
            status:'success',
            banners
        })

    }
    catch(e){
        res.status(400).json({
        status:'failed',
        message:e.message
    })
    }
}
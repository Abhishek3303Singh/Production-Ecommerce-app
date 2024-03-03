const ProductModels = require("../dataBase/product/Product");
require("../dataBase/conf");
const catchError = require("../middleware/asyncError");
const Featurs = require("../utils/featurs");
// const cloudinary = require('cloudinary')
const cloudinary = require("cloudinary");

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    // console.log('checking req Data', req.params.id)
    let reqProduct = await ProductModels.findById(req.params.id);
    if (!reqProduct) {
      return res.status(500).json({
        status: "failed",
        message: "Req Product not found",
      });
    }

    if (req.body.Image !== undefined) {
      for (let i = 0; i < reqProduct.Image.length; i++) {
        await cloudinary.v2.uploader.destroy(reqProduct.Image[i].public_id);
      }

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
          folder: "Products",
        });

        // console.log(resData, 'resData')
        imageLinks.push({
          public_id: resData.public_id,
          url: resData.secure_url,
        });
      }
      // console.log(imageLinks, 'ImageLinks')
      req.body.Image = imageLinks;
    }

    reqProduct = await ProductModels.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, useFindAndModify: false }
    );
    res.status(200).json({
      status: "success",
      reqProduct,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

// read Product
exports.allProducts = async (req, res) => {
  // return res("this is Error")
  try {
    let itemPerPage = 8;
    const totalProduct = await ProductModels.countDocuments();
    const featurs = new Featurs(ProductModels.find(), req.query)
      .search()
      .filter()
      .pagination(itemPerPage);
    //  let allProducts = await ProductModels.find();
    // console.log(featurs, 'featurs')
    let allProducts = await featurs.query;
    // console.log(allProducts)
    res.status(200).json({
      status: "success",
      allProducts,
      totalProduct,
      itemPerPage,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

// get Product Details
exports.productDetails = async (req, res) => {
  try {
    let reqProduct = await ProductModels.findById(req.params.id);
    if (!reqProduct) {
      return res.status(500).json({
        status: "failed",
        message: "Req Product not Available",
      });
    }
    res.status(200).json({
      status: "success",
      reqProduct,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    let reqProduct = await ProductModels.findById(req.params.id);
    if (!reqProduct) {
      return res.status(500).json({
        status: "failed",
        message: "Requested Product not found",
      });
    }

    // Deleting Images from Cloudonary!!
    for (let i = 0; i < reqProduct.Image.length; i++) {
      await cloudinary.v2.uploader.destroy(reqProduct.Image[i].public_id);
    }
    reqProduct = await reqProduct.remove();
    res.status(200).json({
      status: "success",
      message: "Product Deleted successfully",
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};
exports.searchItem = async (req, res) => {
  try {
    let item = req.query;
    // console.log(req.params.item)
    let keyword = item ? { $regex: item, $options: "i" } : {};

    let response = await ProductModels.find({ name: keyword });
    // console.log(response)
    // console.log(item)

    if (item) {
      return res.status(200).json({
        status: "success",
        response,
      });
    } else {
      return res.status(403).json({
        status: "failed",
        message: "Product Not Found!",
      });
    }
  } catch (e) {
    res.status(500).json({
      status: "Failed",
      message: e.message,
    });
  }
};

// Customer review for products
exports.productReview = async (req, res) => {
  // console.log("running")
  // console.log(req.body)
  const { id, feedback, ratings } = req.body.review;

  // console.log(req.body)
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(ratings),
    feedback,
  };
  // console.log(review)

  const product = await ProductModels.findById(id);
  // console.log(product)
  const isReviewed = product.customerReview.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  // console.log("isReviewd", isReviewed);
  if (isReviewed) {
    product.customerReview.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = ratings), (rev.feedback = feedback);
    });
  } else {
    // console.log(product.customerReview);
    product.customerReview.push(review);
    product.reviewsCount = product.customerReview.length;
  }

  // Avarage ratings
  let avRating = 0;
  let totalRating = 0;
  let numOfRating = product.customerReview.length;
  product.customerReview.forEach((cusReview) => {
    // console.log('rating', cusReview.rating)
    totalRating += parseInt(cusReview.rating);
  });
  // console.log('totalRating',totalRating)
  avRating = parseFloat(totalRating / numOfRating);
  // console.log("rating", avRating)
  product.ratings = avRating;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
  });
};

// Get all the review for a Product

exports.getAllReviews = async (req, res) => {
  
  try {
    const productId = req.query.id;
    const product = await ProductModels.findById(productId);
    if (!product) {
      return res.status(400).json({
        status: "failed",
        message: "Product Not found",
      });
    }
    // console.log(product, 'checking req product ')
    return res.status(200).json({
      status: "success",
      customerReview: product.customerReview,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

//Delete customer review
exports.deleteReview = async (req, res) => {
  try {
    const productId = req.query.productId;
    const product = await ProductModels.findById(productId);
    // console.log(product)
    // console.log(req.query.id)
    if (!product) {
      return res.status(400).json({
        status: "failed",
        message: "Product Not found",
      });
    }
    const customerReview = product.customerReview.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );

    // console.log(customerReview)

    let avRating = 0;
    let totalRating = 0;
    let numOfRating = customerReview.length;
    customerReview.forEach((cusReview) => {
      // console.log('rating', cusReview.rating)
      totalRating += parseInt(cusReview.rating);
    });
    // console.log('totalRating',totalRating)
    avRating = parseFloat(totalRating / numOfRating);
    // console.log("rating", avRating)
    ratings = avRating;
    reviewsCount = customerReview.length;
    await ProductModels.findByIdAndUpdate(
      productId,
      {
        customerReview,
        ratings,
        reviewsCount,
      },
      {
        new: true,
        runValidators: false,
        useFindAndModify: false,
      }
    );
    return res.status(200).json({
      status: "success",
      customerReview: product.customerReview,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

// Get All Product Admin

exports.adminAllProducts = async (req, res) => {
  try {
    const totalProduct = await ProductModels.find();
    res.status(200).json({
      status: "success",
      totalProduct,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};
// const cloudinary = cloudinaryModule.v2

// cloudinary.config({
//   cloud_name:process.env.CLOUD_NAME,
//   api_key:process.env.API_KEY,
//   api_secret:process.env.API_SECRET
// });

// Admin Create Product
exports.addProduct = async (req, res) => {
  // console.log(process.env.API_SECRET , 'Api-SECRET')
  // console.log(process.env.API_KEY , 'Api-KEY')
  // console.log(process.env.CLOUD_NAME , 'Cloud-Name')
  // console.log(req.body)

  try {
    // const {name, brand, category, price, Image, offerPrice, title, description} = req.body
    // console.log(req.body, 'Form-DATA')
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
        folder: "Products",
      });

      // console.log(resData, 'resData')
      imageLinks.push({
        public_id: resData.public_id,
        url: resData.secure_url,
      });
    }
    // console.log(imageLinks, 'ImageLinks')
    req.body.Image = imageLinks;

    req.body.user = req.user.id;
    const product = new ProductModels(req.body);
    const response = await product.save();
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

// exports.addProduct=async(req, res)=>{
//   try {
//     console.log(req.body, 'createProduct')

//     if (!req.body.files || Object.keys(req.body.files).length === 0) {
//       return res.status(400).json({ message: 'No files were uploaded.' });
//     }

//     const imageUrls = [];

//     // Upload each image to Cloudinary
//     const fileKeys = Object.keys(req.body.files.images);
//     for (const key of fileKeys) {
//       const image = req.body.files.images[key];

//       const result = await cloudinary.uploader.upload(image.tempFilePath);
//       imageUrls.push(result.secure_url);
//     }

//     return res.status(200).json({ imageUrls });
//   } catch (error) {
//     return res.status(500).json({ message: 'Error uploading images to Cloudinary.' });
//   }
// };

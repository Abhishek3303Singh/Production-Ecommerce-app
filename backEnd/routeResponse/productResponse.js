const ProductModels = require("../dataBase/product/Product");
require("../dataBase/conf");

const { productsTrie } = require("../utils/buildTrie");
const Featurs = require("../utils/featurs");
// const cloudinary = require('cloudinary')
const cloudinary = require("cloudinary");
const mongoose = require("mongoose");
const redisClient = require("../config/redis");
const catalog = require('../utils/catalog');
const { raw } = require("body-parser");
const { clearProductCache } = require("../utils/clearCatch");


const EDITABLE = ['title', 'name', 'brand', 'category', 'productType', 'gender', 'price', 'offerPrice', 'description', 'Stock'];
const parseJson = (v, fallback)=>{
  if(v===undefined || v===null || v=== '') return fallback;
  if(typeof v !== 'string') return v
  try{
    return JSON.parse(v)

  }catch(e){
    throw new Error('Invalid data format')
  }

}

const cleanVariants = (raw)=>{
  const list = parseJson(raw, []);
  if(!Array.isArray(list)) throw new Error('Variants must be a list');
  return list.map((v)=>({
    _id:mongoose.isValidObjectId(v._id)? v._id : undefined, // keep the id of existing variants.....
    sku: v.sku || undefined,
    size:String(v.size || '').trim(),
    color:String(v.color || '').trim(),
    colorHex:v.colorHex || undefined,
    stock:Math.max(0, parseInt(v.stock, 10) || 0)
  }));
};

const cleanAttri = (raw, allowed)=>{
  const obj = parseJson(raw, {});
  const out ={}
  Object.entries(obj).forEach(([k,v])=>{
    const val = String(v ?? '').trim()
    if(val && allowed.includes(k)){
      out[k] = val
    }
  })
  return out
}
const validateAgainstCatalog = ({category, productType, gender, variants})=>{
  const categ = catalog[category]
  if(!categ){
    throw new Error(`Invalid Category: ${category}`)
  }
const type = categ.types[productType]
if(!type){
  throw new Error(`"${productType}" is not valid type for ${category}`)
}
if(gender && categ.gender && !categ.gender.includes(gender)){
  throw new Error('Invalid gender type')
}
if(categ.hasVariants && !variants.length){
  throw new Error('Add at least one size/color variant')
}
if(!categ.hasVariants && variants.length){
  throw new Error(`${category} don't use variants`)
}
return type
}


const imageUpload = async(inp)=>{
  const list = typeof inp === 'string' ? [inp] : inp || []
  const done = []
  try{
    for(const img of list){
      const resp = await cloudinary.v2.uploader.upload(img, {
        folder:'Products',
        timeout:120000,
        resource_type:'image'

      })
      done.push({public_id:resp.public_id, url:resp.secure_url})
    }
    return done 

  }catch(e){
    // If the third image fails, remove the first two instead of leaving them behind
    await Promise.all(done.map((i) => cloudinary.v2.uploader.destroy(i.public_id).catch(() => {})));
    throw err;

  }
  // return Promise.all(list.map(async(img)=>{
  //   const resp  = await cloudinary.v2.uploader.upload(img, {folder:'Products'})
  //   return {public_id:resp.public_id, url:resp.secure_url} 
  // }))
}

exports.getCatalog = async(req, res)=>{
  try{
    const counts = await ProductModels.aggregate([{
      $group:{_id:'$category', count:{$sum:1}}
    }])
    const countMap = Object.fromEntries(counts.map((c)=>[c._id, c.count]));
    res.status(200).json({
      status:'success',
      catalog,
      categories:Object.keys(catalog).map((name)=>({name, count:countMap[name] || 0})),
    })

  }catch(err){
    res.status(400).json({
      status:'success',
      message:err.message
    })
  }
}

// Update Product
exports.updateProduct = async (req, res) => {
  const uploaded = []
  try {
    // console.log('checking req Data', req.params.id)
    let reqProduct = await ProductModels.findById(req.params.id);
    if (!reqProduct) {
      return res.status(404).json({
        status: "failed",
        message: "Product not found",
      });
    }
    const b = req.body
    EDITABLE.forEach((k)=>{
      if(b[k] !== undefined){
        reqProduct[k] = b[k]
      }
    })
    if(b.searchKeywords !== undefined){
        reqProduct.searchKeywords = parseJson(b.searchKeywords, [])
    }
    if(b.variants !== undefined){
      reqProduct.variants = cleanVariants(b.variants)
    }
    const type = validateAgainstCatalog({
      category:reqProduct.category,
      productType:reqProduct.productType,
      gender:reqProduct.gender,
      variants:reqProduct.variants.toObject(),
    })

    if(b.attributes !== undefined){
      reqProduct.attributes = cleanAttri(b.attributes, type.attributes || [])
    }

    // image keep older one then upload new one then del remove once after save [importnatly]

    let removed = []


    if(b.keepImages !== undefined || b.newImages !== undefined){
      const keep = parseJson(b.keepImages, reqProduct.Image.map((img)=>img.public_id))
      uploaded = await imageUpload(b.newImages)
      removed = reqProduct.Image.filter((img)=> !keep.includes(img.public_id))
      reqProduct.Image = [...reqProduct.Image.filter((img)=>keep.includes(img.public_id))]
      if(!reqProduct.Image.length){
        throw new Error('A product needs at least one image.')
      }


    }
    await reqProduct.save()  // run validation , and the pre-validate hook keep stock in sync 
    await Promise.all(removed.map((img)=>cloudinary.v2.uploader.destroy(img.public_id).catch(()=>{})))
    await clearProductCache()



    // if (req.body.searchKeywords) {
    //   try {
    //     // If it's a string, parse it to array
    //     if (typeof req.body.searchKeywords === "string") {
    //       req.body.searchKeywords = JSON.parse(req.body.searchKeywords);
    //     }
    //   } catch (e) {
    //     console.error("Error parsing searchKeywords:", e);
    //     req.body.searchKeywords = [];
    //   }
    // }

    // if (req.body.Image !== undefined) {
    //   for (let i = 0; i < reqProduct.Image.length; i++) {
    //     await cloudinary.v2.uploader.destroy(reqProduct.Image[i].public_id);
    //   }

    //   let images = [];
    //   // console.log(typeof req.body.Image, 'Image-Type!!')
    //   if (typeof req.body.Image === "string") {
    //     images.push(req.body.Image);
    //   } else {
    //     images = req.body.Image;
    //   }

    //   const imageLinks = [];
    //   for (let i = 0; i < images.length; i++) {
    //     // console.log(images[i], 'images')
    //     const resData = await cloudinary.v2.uploader.upload(images[i], {
    //       // upload_preset:'FunHub',
    //       folder: "Products",
    //     });

    //     // console.log(resData, 'resData')
    //     imageLinks.push({
    //       public_id: resData.public_id,
    //       url: resData.secure_url,
    //     });
    //   }
    //   // console.log(imageLinks, 'ImageLinks')
    //   req.body.Image = imageLinks;
    // }

    // reqProduct = await ProductModels.findByIdAndUpdate(
    //   req.params.id,
    //   req.body,
    //   { new: true, runValidators: true, useFindAndModify: false }
    // );
    res.status(200).json({
      status: "success",
      reqProduct:reqProduct,
    });
  } catch (e) {
    await Promise.all(uploaded.map((img) => cloudinary.v2.uploader.destroy(img.public_id).catch(() => {})));
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};
exports.getAvailableFilters = async (req, res) => {
  try {
    const { category, productType } = req.query;

    if (!category || category === "All") {
      return res.json({
        status: "success",
        data: { productTypes: [], brands: [], attributes: {} },
      });
    }

    const cacheKey = `filters:${category}:${productType || "none"}`;
    let cached = null;
    try {
      cached = await redisClient.get(cacheKey);
    } catch (e) {
      console.log("Redis get error:", e.message);
    }

    if (cached) {
      return res.json({
        status: "success",
        source: "redis",
        data: JSON.parse(cached),
      });
    }

    let responseData;
    

    if (!productType) {
      // Stage 1: only category chosen — return the product types within it
      const productTypes = await ProductModels.distinct("productType", {
        category,
      });
      responseData = {
        productTypes: productTypes.sort(),
        brands: [],
        attributes: {},
      };
    } else {
      // Stage 2: category + productType chosen — return brands/attributes scoped to BOTH
      const productTypeArray = productType.split(",");
      const match = {
        category,
        productType:
          productTypeArray.length === 1
            ? productTypeArray[0]
            : { $in: productTypeArray },
      };

      // const brands = await ProductModels.distinct("brand", match);

      const [attributeAgg] = await ProductModels.aggregate([
        { $match: match },
        {
          $facet: {
            brands: [{ $group: { _id: "$brand" } }],
            genders: [
              { $match: { genders: { $nin: [null, ""] } } },
              { $group: { _id: "$gender" } },
            ],
            size: [
              { $unwind: "$variants" },
              { $match: { "variants.size": { $nin: [null, ""] } } },
              { $group: { _id: "$variants.size" } },
            ],
            colors: [
              { $unwind: "$variants" },
              { $match: { "variants.color": { $nin: [null, ""] } } },
              { $group: { _id: "$variants.color" } },
            ],
            attributes: [
              {
                $project: {
                  attributesArray: { $objectToArray: "$attributes" },
                },
              },
              { $unwind: "$attributesArray" },
              {
                $group: {
                  _id: "$attributesArray.k",
                  values: { $addToSet: "$attributesArray.v" },
                },
              },
            ],
          },
        },
      ]);

      // const attributes = attributeAgg.reduce((acc, item) => {
      //   acc[item._id] = item.values.sort();
      //   return acc;
      // }, {});

      responseData = { 
        productTypes: [],
         brands: attributeAgg.brands.map((b)=>b._id).sort(),
         genders:attributeAgg.genders.map((g)=>g._id).sort(),
         size:attributeAgg.size.map((s)=>s._id).sort(),
         colors:attributeAgg.colors.map((c)=>c._id).sort(),
         attributes:Object.fromEntries(attributeAgg.attributes.map((a)=>[a._id, a.values.sort()]))
         
        };
    }

    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
    } catch (e) {
      console.log("Redis set error:", e.message);
    }

    res.json({ status: "success", source: "db", data: responseData });
  } catch (e) {
    res.status(400).json({ status: "failed", message: e.message });
  }
};

// read Product

// helper fuction
const LIST_EXCLUDE =
  " -customerReview -description -searchkeywords -attributes";
async function runProductQuery(queryString, itemPerPage) {
  const featurs = new Featurs(ProductModels.find(), queryString)
    .search()
    .filter();
  const totalProduct = await ProductModels.countDocuments(
    featurs.query.getFilter()
  ).read("secondaryPreferred");
  featurs.sort().pagination(itemPerPage);
  const allProducts = await featurs.query
    .select(LIST_EXCLUDE)
    .read("secondaryPreferred");
  return { allProducts, totalProduct, itemPerPage };
}
exports.allProducts = async (req, res) => {
  // return res("this is Error")
  try {
    // const cacheKey = `products:${JSON.stringify(req.query)}`
    let itemPerPage = 8;
    // Normalize query (IMP)
    const sortedQuery = Object.keys(req.query)
      .sort()
      .reduce((acc, key) => {
        acc[key] = req.query[key];
        return acc;
      }, {});

    const cacheKey = `products:${JSON.stringify(sortedQuery)}`;
    const lockKey = `lock:${cacheKey}`;
    let cacheData = null;

    // first of all we will check redis for requested data if available we will get from that and return it without hitting actual db.
    // safe redis read [prevent crash on redis down]
    try {
      cacheData = await redisClient.get(cacheKey);
    } catch (e) {
      console.log("Redis get error:", e.message);
    }

    if (cacheData) {
      return res.json({
        status: "success",
        source: "redis",
        data: JSON.parse(cacheData),
      });
    }
    let lock = null;
    try {
      lock = await redisClient.set(lockKey, "1", { NX: true, EX: 5 });
    } catch (e) {
      console.log("Redis lock eror:", e.message);
    }

    if (lock) {
      try {
        const responseData = await runProductQuery(req.query, itemPerPage);

      
        // Store in redis

        try {
          // cache write  Safe Redis Write + TTL jitter (stampede protection)
          await redisClient.setEx(
            cacheKey,
            60 + Math.floor(Math.random() * 10),
            JSON.stringify(responseData)
          );
        } catch (e) {
          console.log("redis set error:", e.message);
        }

        res.status(200).json({
          status: "success",
          source: "db",
          // allProducts,
          // totalProduct,
          // itemPerPage,
          data: responseData,
        });
      } finally {
        //   release lock
        try {
          await redisClient.del(lockKey);
        } catch (e) {
          console.log("Redis DEL lock error:", e.message);
        }
      }
    } else {
      // OTHER REQUESTS (WAIT & RETRY)
      await new Promise((res) => setTimeout(res, 100));
      try {
        const retryCache = await redisClient.get(cacheKey);

        if (retryCache) {
          return res.status(200).json({
            status: "success",
            source: "redis-retry",
            data: JSON.parse(retryCache),
          });
        }
      } catch (e) {
        console.log("redis retry error:", e.message);
      }
      // final fallback to db
      const data = await runProductQuery(req.query, itemPerPage);
      return res.status(200).json({
        status: "success",
        source: "db-fallback",
        data: data,
      });
    }

    // console.log(allProducts)
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};
// search suggestion controller functio//
exports.searchSuggestion = (req, res) => {
  const q = req.query.keyword;
  if (!q) {
    return res.status(200).json({
      status: "success",
      suggestionName: [],
    });
  }
  const suggestionList = productsTrie.search(q);
  return res.status(200).json({
    status: "success",
    suggestionName: suggestionList,
  });
};

// get Product Details
exports.productDetails = async (req, res) => {
  try {
    // let reqProduct = await ProductModels.findById(req.params.id);
    const bump = req.query.view !== '0'

    let reqProduct = bump ? await ProductModels.findByIdAndUpdate(req.params.id, {$inc:{views:1}}, {new:true}) : await ProductModels.findById(req.params.id)
    if (!reqProduct) {
      return res.status(404).json({
        status: "failed",
        message: "Product not available",
      });
    }
    // reqProduct.views += 1;
    // await reqProduct.save();
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

// Category Based Recomendation Response

exports.recommendedProduct = async (req, res) => {
  try {
    const currProduct = await ProductModels.findById(req.params.productId);
    if (!currProduct) {
      return res.status(404).json({
        status: "failed",
        message: " Product not available",
      });
    }

    const recomnededProduct = await ProductModels.find({
      category: currProduct.category,
      _id: { $ne: currProduct._id }, Stock:{$gt:0}
    }).select(LIST_EXCLUDE).limit(6);

    return res.status(200).json({
      status: "success",
      recomnededProduct,
    });
  } catch (e) {
    return res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

// Tending Products Recomendation

exports.trendingProducts = async (req, res) => {
  try {
    const tendingProd = await ProductModels.find({Stock:{$gt:0}}).select(LIST_EXCLUDE).sort({ views: -1 }).limit(8);
    return res.status(200).json({
      status: "success",
      tendingProd,
    });
  } catch (e) {
    return res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

// Best Sellers

exports.bestSeller = async (req, res) => {
  try {
    // const bestSeller = await (await ProductModels.find({Stock:{$gt:0}})).select(LIST_EXCLUDE).sort({ sold: -1 }).limit(8);
    const bestSeller = await ProductModels.find({Stock:{$gt:0}}).select(LIST_EXCLUDE).sort({sold:-1}).limit(8)
    return res.status(200).json({
      status: "success",
      bestSeller,
    });
  } catch (e) {
    return res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};
// Recently Viewed Products

exports.getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({
        status: "failed",
        message: "Product ids not Provided",
      });
    }
    const idsArray = ids.split(",");
    // ObjectIds Validate
    if (idsArray?.length > 15) {
      return res.status(400).json({
        status: "failed",
        message: "Too many product IDs requested",
      });
    }

    const idsValid = idsArray?.filter((id) =>
      mongoose.Types.ObjectId.isValid(id.trim())
    );
 
    // short-circuit if no valid IDS survived the check
    if(idsValid.length ===0){
      return res.status(200).json({
        status:'success',
        results:0,
        recentlyViewedProd:[]
      })
    }

    const products = await ProductModels.find({
      _id: { $in: idsValid },
    });
    return res.status(200).json({
      status: "success",
      results: products?.length,
      recentlyViewedProd: products,
    });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({
      status: "failed",
      message: "server error",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    let reqProduct = await ProductModels.findById(req.params.id);
    if (!reqProduct) {
      return res.status(404).json({
        status: "failed",
        message: "Product not found",
      });
    }
    await reqProduct.deleteOne()
    // del image only when product is gone 
    await Promise.all(reqProduct.Image.map((img)=>cloudinary.v2.uploader.destroy(img.public_id).catch(()=>{})))
    await clearProductCache()

    // Deleting Images from Cloudonary!!
    // for (let i = 0; i < reqProduct.Image.length; i++) {
    //   await cloudinary.v2.uploader.destroy(reqProduct.Image[i].public_id);
    // }
    // reqProduct = await reqProduct.remove();
    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
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
  // console.log(req.body);
  const { id, feedback ='', ratings } = req.body;
  const rating = Number(ratings)
  if(!mongoose.isValidObjectId(id) || !(rating>=1 && rating<=5)){
    return res.status(400).json({
      status:'failed',
      message:'Invalid review data'
    })
  }
  const text = String(feedback).trim().slice(0, 500)

  const product = await ProductModels.findById(id);
  if (!product) {
    return res.status(404).json({
      status: "failed",
      message: "Product not found",
    });
  }

  const uid = String(req.user._id)
  let mine = product.customerReview.find((r)=>{String(r.user)===uid})
  if(mine){
    mine.rating = rating,
    mine.feedback = text
  }else{
    product.customerReview.push({user:req.user._id, name:req.user.name, rating, feedback:text})
    
  }

  const n = product.customerReview.length;
  product.rating = Number((product.customerReview.reduce((s, r)=> s+ Number(r.rating || 0), 0)/n).toFixed(2))
  
  
  // const review = {
  //   user: req.user._id,
  //   name: req.user.name,
  //   rating: Number(ratings),
  //   feedback,
  // };
  


  
  // const isReviewed = product.customerReview.find(
  //   (rev) => rev.user.toString() === req.user._id.toString()
  // );
  
  // if (isReviewed) {
  //   product.customerReview.forEach((rev) => {
  //     if (rev.user.toString() === req.user._id.toString())
  //       (rev.rating = ratings), (rev.feedback = feedback);
  //   });
  // } else {
    
  //   product.customerReview.push(review);
  //   product.reviewsCount = product.customerReview.length;
  // }

  // Avarage ratings
  // let avRating = 0;
  // let totalRating = 0;
  // let numOfRating = product.customerReview.length;
  // product.customerReview.forEach((cusReview) => {
  //   totalRating += parseInt(cusReview.rating);
  // });
  
  // avRating = parseFloat((totalRating / numOfRating).toFixed(2));
  
  // product.ratings = avRating;
  await product.save({ validateBeforeSave: false });
  const newReview = product.customerReview[product.customerReview.length - 1];
  res.status(200).json({
    status: "success",
    review: newReview,
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
    const {productId, id} = req.query;
    const product = await ProductModels.findById(productId);
    // console.log(product)
    // console.log(req.query.id)
    if (!product) {
      return res.status(404).json({
        status: "failed",
        message: "Product not found",
      });
    }

    const review = product.customerReview.id(id)
    if(!review){
      return res.status(404).json({
        status:'failed',
        message:'Review not found'
      })
    }
    const isOwner = String(review.user) === req.user._id
    const isAdmin = req.user.role === 'Admin'
    if(!isAdmin && !isOwner){
      return res.status(404).json({
        status:'failed',
        message:'You can only delete your own review'
      })
    }
    const customerReview = product.customerReview.filter(
      (rev) => rev._id.toString() !== String(id)
    );


    // console.log(customerReview)

    let avRating = 0;
    let totalRating = 0;
    let numOfRating = customerReview.length;
    customerReview.forEach((cusReview) => {
      // console.log('rating', cusReview.rating)
      totalRating += Number(cusReview.rating);
    });
    // console.log('totalRating',totalRating)
    avRating = (Number(totalRating / numOfRating)).toFixed(2);
    // console.log("rating", avRating)
    ratings = avRating;
    reviewsCount = customerReview.length;
    const updated = await ProductModels.findByIdAndUpdate(
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
      customerReview: updated.customerReview,
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
    const totalProduct = await ProductModels.find().select('-customerReview -description -searchKeywords').sort({_id:-1});
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
  console.log('request.body , add prod data is comming ')
  let uploaded =[]

  try {
    // const {name, brand, category, price, Image, offerPrice, title, description} = req.body
    // console.log(req.body, 'Form-DATA')
    // let images = [];
    const b = req.body
    const variants = cleanVariants(b.variants)
  console.log('running clean variants')
    const type = validateAgainstCatalog({...b, variants})
    console.log('runnig validateAgainstCatalog')
    uploaded = await imageUpload(b.Image)
    console.log('runnig imageupload')

    if(!uploaded.length){
      throw new Error('Add at least one image')
    }
    const doc = {}
    EDITABLE.forEach((k)=>{
      if(b[k] !== undefined){
        doc[k] = b[k]
      }
    })
    const product = await ProductModels.create({
      ...doc,
      variants,
      attributes:cleanAttri(b.attributes, type.attributes || []),
      searchKeywords:parseJson(b.searchKeywords , []),
      Image:uploaded,
      user:req.user._id,
    })
    console.log('runnig craete product ... ')
  
    // if (typeof req.body.Image === "string") {
    //   images.push(req.body.Image);
    // } else {
    //   images = req.body.Image;
    // }

    // const imageLinks = [];
    // for (let i = 0; i < images.length; i++) {
    //   // console.log(images[i], 'images')
    //   const resData = await cloudinary.v2.uploader.upload(images[i], {
    //     // upload_preset:'FunHub',
    //     folder: "Products",
    //   });

    //   // console.log(resData, 'resData')
    //   imageLinks.push({
    //     public_id: resData.public_id,
    //     url: resData.secure_url,
    //   });
    // }
    // // console.log(imageLinks, 'ImageLinks')
    // req.body.Image = imageLinks;
    // req.body.searchKeywords = JSON.parse(req.body.searchKeywords);

    // req.body.user = req.user.id;
    // const product = new ProductModels(req.body);
    // const response = await product.save();
    await clearProductCache();

    res.status(201).json({
      status: "success",
      response:product,
    });
  } catch (e) {
    console.error('addProduct failed:', e) 
    const errorMessage = (e) => e?.message || e?.error?.message || 'Something went wrong';
const errorStatus = (e) => (e?.error?.http_code === 499 ? 504 : 400);
    await Promise.all(uploaded.map((img)=>cloudinary.v2.uploader.destroy(img.public_id).catch(()=>{})))
    // res.status(400).json({
    //   status: "failed",
    //   message: e.message,
    // });

    res.status(errorStatus(e)).json({
      status: 'failed',
      message: e?.error?.http_code === 499
        ? 'Image upload timed out. Try fewer or smaller images.'
        : errorMessage(e),
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

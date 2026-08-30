const Banner = require("../dataBase/banner");
const cloudinary = require("cloudinary");
const redisClient = require("../config/redis");


// ================= CREATE =================
exports.createBanner = async (req, res) => {
  try {
    console.log('running creating banner')
    const {
      title,
      description,
      ctaText,
      ctaUrl,
      position,
      priority,
      displayOrder,
      startDate,
      endDate,
      targeting,
      desktopImage,   //we have  { public_id, url } from frontend
      mobileImage,//   same for moble{ public_id, url } or null
      themeColor    
    } = req.body;

    // Validation
    if (!title?.trim()) throw new Error('Title is required');
    if (!ctaUrl?.trim()) throw new Error('CTA URL is required');
    if (!endDate) throw new Error('End date is required');
    if (!desktopImage?.public_id) throw new Error('Desktop image upload failed');

    const banner = await Banner.create({
      title,
      description,
      ctaText,
      ctaUrl,
      position,
      priority: Number(priority),
      displayOrder: Number(displayOrder),
      startDate,
      endDate,
      targeting,
      desktopImage,
      mobileImage: mobileImage?.public_id ? mobileImage : desktopImage,
      themeColor,
      createdBy: req.user._id,
    });

    // Clear cache
    const keys = await redisClient.keys("banner:*");
    if (keys.length) await redisClient.del(keys);

    res.status(201).json({ success: true, banner });

  } catch (err) {
    console.log('error fron catch of cfreating banner...', err)
    res.status(400).json({ message: err.message });
  }
};


// ================= UPDATE =================
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    let desktopImage = banner.desktopImage;
    let mobileImage = banner.mobileImage;

    if (req.body.desktopImage) {
      const upload = await cloudinary.v2.uploader.upload(req.body.desktopImage);
      desktopImage = { public_id: upload.public_id, url: upload.secure_url };

      if (banner.desktopImage?.public_id) {
        await cloudinary.v2.uploader.destroy(banner.desktopImage.public_id);
      }
    }

    if (req.body.mobileImage) {
      const upload = await cloudinary.v2.uploader.upload(req.body.mobileImage);
      mobileImage = { public_id: upload.public_id, url: upload.secure_url };

      if (banner.mobileImage?.public_id) {
        await cloudinary.v2.uploader.destroy(banner.mobileImage.public_id);
      }
    }

    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      { ...req.body, desktopImage, mobileImage },
      { new: true }
    );

    const keys = await redisClient.keys("banner:*");
    if (keys.length) await redisClient.del(keys);

    res.json({ success: true, banner: updated });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ================= DELETE =================
exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      status: "paused",
    });

    const keys = await redisClient.keys("banner:*");
    if (keys.length) await redisClient.del(keys);

    res.json({ success: true });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ================= GET (MAIN API) =================
exports.getBanners = async (req, res) => {
  try {
    const { position = "hero" } = req.query;

    const device = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(req.headers["user-agent"] || "") 
        ? "mobile" 
        : "desktop";

    const userSegment = req.user ? "returning" : "new";
    

    

    const cacheKey = `banner:${position}:${device}:${userSegment}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        source: "redis",
        data: JSON.parse(cached),
      });
    }

    const now = new Date();

    const banners = await Banner.find({
      position,
      status: "active",
      isDeleted: false,
      startDate: { $lte: now },
      endDate: { $gte: now },
      "targeting.userSegments": { $in: [userSegment, "all"] },
      "targeting.device": { $in: [device, "all"] },
    })
      .sort({ displayOrder: -1, priority: -1 })
      .limit(position === "hero" ? 5 : 3)
      .lean();

    const response = banners.map((b) => ({
      _id: b._id,
      title: b.title,
      image:
        device === "mobile" && b.mobileImage?.url
          ? b.mobileImage.url
          : b.desktopImage.url,
      ctaText: b.ctaText,
      ctaUrl: b.ctaUrl,
      position: b.position,
      themeColor:b.themeColor,
    }));

    await redisClient.setEx(cacheKey, 60, JSON.stringify(response));

    // analytics (redis)
    banners.forEach((b) => {
      redisClient.incr(`banner:${b._id}:impressions`);
    });

    res.json({
      source: "db",
      data: response,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= CLICK =================
exports.trackClick = async (req, res) => {
  try {
    await redisClient.incr(`banner:${req.params.id}:clicks`);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ================= POSITION UPDATE =================
exports.updateBannerPosition = async (req, res) => {
  try {
    const { position, displayOrder } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { position, displayOrder },
      { new: true }
    );
    const keys = await redisClient.keys("banner:*");
    if (keys.length) await redisClient.del(keys);

    res.json({ success: true, banner });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ================= ADMIN LIST =================
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ================= ANALYTICS =================
exports.getBannerAnalytics = async (req, res) => {
  try {
    const data = await Banner.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          impressions: { $sum: "$impressions" },
          clicks: { $sum: "$clicks" },
        },
      },
    ]);

    res.json({ success: true, analytics: data[0] });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ================= SYNC ANALYTICS (CRON JOB / MANUAL) =================
exports.syncAnalyticsToDB = async (req, res) => {
  try {
    // Get all impression keys from Redis
    const impressionKeys = await redisClient.keys("banner:*:impressions");
    
    for (const key of impressionKeys) {
      const bannerId = key.split(":")[1];  // Extract banner ID from key
      const count = parseInt(await redisClient.get(key)) || 0;
      
      if (count > 0) {
        // Update MongoDB
        await Banner.findByIdAndUpdate(bannerId, {
          $inc: { impressions: count }
        });
        
        // Clear Redis key after sync
        await redisClient.del(key);
      }
    }

    // Same for clicks
    const clickKeys = await redisClient.keys("banner:*:clicks");
    
    for (const key of clickKeys) {
      const bannerId = key.split(":")[1];
      const count = parseInt(await redisClient.get(key)) || 0;
      
      if (count > 0) {
        await Banner.findByIdAndUpdate(bannerId, {
          $inc: { clicks: count }
        });
        
        await redisClient.del(key);
      }
    }

    res.json({
      success: true,
      message: "Analytics synced to DB",
      synced: {
        impressions: impressionKeys.length,
        clicks: clickKeys.length
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
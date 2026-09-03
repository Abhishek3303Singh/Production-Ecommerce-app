
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },

    // Images
    desktopImage: {
      public_id: String,
      url: String,
    },
    mobileImage: {
      public_id: String,
      url: String,
    },

    // Positioning
    position: {
      type: String,
      enum: ["hero", "mid", "mid2", "bottom", "sidebar", 'promotion', 'hero2'],
      default: "hero",
      index: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    priority: {
      type: Number,
      default: 0,
    },

    // Scheduling
    startDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Targeting
    targeting: {
      userSegments: {
        type: String,
        enum: ["new", "returning", "premium", "all"],
        default: "all",
        index: true,
      },
      device: {
        type: String,
        enum: ["mobile", "desktop", "all"],
        default: "all",
        index: true,
      },
    },

    // CTA
    ctaText: {
      type: String,
      default: "Shop Now",
    },
    ctaUrl: {
      type: String,
      required: true,
    },

    // Analytics
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
      index: true,
    },
    themeColor: {
      type: String,
      default: '#131921', 
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: true,
    },
    // color theme

  },
  { timestamps: true }
);

bannerSchema.index({
  position: 1,
  displayOrder: -1,
  priority: -1,
});

module.exports = mongoose.model("Banner", bannerSchema);

const cloudinary = require('cloudinary').v2;

exports.getCloudinarySignature = (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    
    // Parameters you want to enforce
    const paramsToSign = {
      timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET, // 'banner_preset'
      
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,        
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,  
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
  } catch (err) {
   
    res.status(500).json({ message: err.message });
  }
};
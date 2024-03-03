const ProfileModel = require("../dataBase/Profile");
require("../dataBase/conf");

exports.profile = async (req, res) => {
  try {
    const userProfile = new ProfileModel(req.body);
    console.log(userProfile);
    const profileResponse = await userProfile.save();
    // console.log("response=>", profileResponse)
    res.status(200).json({
      status: "success",
      profileResponse,
    });
  } catch (e) {
    res.status(500).json({
      status: "failed",
      message: e.message,                                                                                                                                                                                                                                                                                                             
    });
  }
};

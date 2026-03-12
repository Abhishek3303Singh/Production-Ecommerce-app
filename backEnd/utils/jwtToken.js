const sendToken = (user, statusCode, res) => {
    // const token = user.getJWTToken();
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "7d" });
  
    // options for cookie
    const options = {
      expires: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
  
    res.status(statusCode).cookie("token", token).json({
      success: true,
      user,
      token,
    });
  };
  
  module.exports = sendToken;
  
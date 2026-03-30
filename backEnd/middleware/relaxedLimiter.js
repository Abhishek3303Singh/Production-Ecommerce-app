const redisClient = require("../config/redis");

const WINDOW_SIZE = 60; // seconds
let MAX_REQ;

const slidingWindowRateLimiter = async (req, res, next) => {
  try {
    const role = req.user?.role;
    if (role === "Admin") {
      MAX_REQ = 100;
    } else {
      MAX_REQ = 50;
    }
    const identifier = req.user?.id || req.ip;
    const key = `rate_limit:${identifier}`;
    const currTime = Date.now(); // ms
    const windowStart = currTime - WINDOW_SIZE * 1000;
    // removing old req
    await redisClient.zRemRangeByScore(key, 0, windowStart);
    // count curr reqs
    const currRequests = await redisClient.zCard(key);
    if (currRequests >= MAX_REQ) {
      return res.status(429).json({
        message: "Too many requests please try later",
      });
    }
    // else adding current req
    await redisClient.zAdd(key,[{
      score: currTime,
      value: `${currTime}`,
    }]);

    //  expiry
    await redisClient.expire(key, WINDOW_SIZE);
    next();
  } catch (err) {
    console.log("Rate Limiter Error", err);
    next();
  }
};

module.exports = slidingWindowRateLimiter;

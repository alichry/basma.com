import rateLimit from 'express-rate-limit';

const createLimiter = (): rateLimit.RateLimit => {
  return rateLimit({
    windowMs: 60 * 15 * 1000,
    max: 15,
    message:
          "Too many requests came from this IP, please try again in 15 minutes",
    handler: function (req, res, /*next*/) {
      res.status(400).json({
        message: this.message
      });
    }
  })
}

export default createLimiter;
const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  const token = req.header("authorization")
  if (token) {
    try {
      const verified = jwt.verify(token, process.env.SECRET_TOKEN)
      req.user = verified
      next()
    } catch (err) {
      res.json({ msg: "Invalid Token" })
    }
  } else {
    return res.json({ msg: "Unauthorized" })
  }
}

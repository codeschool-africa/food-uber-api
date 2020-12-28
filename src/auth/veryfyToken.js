const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  const token = req.header("authorization")
  // console.log(token, "Hello")
  if (!token) return res.json({ msg: "Unauthorized" })
  try {
    const verified = jwt.verify(token, process.env.SECRET_TOKEN)
    req.user = verified
    next()
  } catch (err) {
    res.status(400).json({ msg: "Invalid Token" })
  }
}

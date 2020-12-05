const { validationResult } = require("express-validator")
const db = require("../models/db")
const jwt = require("jsonwebtoken")

exports.addToCart = async (req, res) => {
  let createdAt = new Date()

  let decoded

  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (decoded.id) {
      let sql = `insert into carts values (id,?,?,?,?,?)`
      let foodCheck = `select * from foods where id = '${req.params.foodId}'`
      let userCheck = `select * from users where id = '${decoded.id}'`
      let cartCheck = `select * from carts where foodId = '${req.params.foodId}' and userId = '${req.decoded.id}'`
      db.query(userCheck, (err, output) => {
        if (err) throw err
        if (output && output.length > 0) {
          db.query(foodCheck, (err, result) => {
            if (err) throw err
            if (result && result.length > 0) {
              db.query(cartCheck, (err, outputs) => {
                if (err) throw err
                if (outputs && outputs.length > 0) {
                  res.status(400).json({ msg: "Food already added to cart" })
                } else if (outputs && outputs.length === 0) {
                  // console.log( result )
                  db.query(
                    sql,
                    [
                      req.params.foodId,
                      result[0].name,
                      decoded.id,
                      createdAt,
                      result[0].food_image,
                    ],
                    (err, results) => {
                      if (err) throw err
                      if (results) {
                        res
                          .status(200)
                          .json({ results, msg: "Food added to cart" })
                      } else {
                        res.json({
                          msg:
                            "Your request couldn't be processed,  please try again",
                        })
                      }
                    }
                  )
                } else {
                  res.status(500).json({ msg: "Internal server error" })
                }
              })
            } else if (result && result.length === 0) {
              res.status(404).json({ msg: "Food not found" })
            } else {
              res.status(500).json({ msg: "Internal server error" })
            }
          })
        } else if (output && output.length === 0) {
          res
            .status(404)
            .json({ msg: "User with your credentials could't be found" })
        } else {
          res.status(500).json({ msg: "Internal server error" })
        }
      })
    } else {
      res.status(403).json({ msg: "Unauthorized" })
    }
  }
}

exports.removeFromCart = async (req, res) => {
  let cartCheck = `select * from carts where id = '${req.params.cartId}'`
  let sql = `delete from carts where id = '${req.params.cartId}'`

  let decoded

  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (decoded.id) {
      db.query(cartCheck, (err, output) => {
        if (err) throw err
        if (
          output &&
          output.length > 0 &&
          output[0].userId === req.decoded.id
        ) {
          db.query(sql, (err, results) => {
            if (err) throw err
            if (results) {
              res
                .status(200)
                .json({ results, msg: "Cart deleted successfully" })
            } else {
              res
                .status(500)
                .json({ msg: "Internal server error, please try again" })
            }
          })
        } else if (output && output.length === 0) {
          res.status(404).json({ msg: "Cart not found" })
        } else {
          res.status(500).json({ msg: "Internal server error" })
        }
      })
    }
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

exports.myCart = async (req, res) => {
  let decoded

  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    let sql = `select * from carts where userId = '${decoded.id}'`
    db.query(sql, (err, results) => {
      if (err) throw err
      if (results && results.length > 0) {
        res
          .status(200)
          .json({ results, msg: "Your cart were retrieved successfully" })
      } else if (results && results.length === 0) {
        res.status(404).json({ msg: "You didn't add any food to cart" })
      } else {
        res
          .status(500)
          .json({ msg: "Couldn't retrieve your cart, please try again" })
      }
    })
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

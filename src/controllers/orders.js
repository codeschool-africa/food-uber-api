const { validationResult } = require("express-validator")
const db = require("../models/db")
const jwt = require("jsonwebtoken")
const utmObj = require("utm-latlng")

// const { createNotifications } = require( "./user" )

exports.placeOrder = async (req, res) => {
  const { location, foods, orderedBy, totalCost } = req.body
  const errors = validationResult(req)
  let createdAt = new Date()

  // let decoded
  let delivery_cost

  let sql = `insert into orders values (id,?,?,?,?,?,?,?)`

  let notify = `insert into notifications values (id,?,?,?,0)`

  // console.log(location, foods, orderedBy)

  let data = JSON.parse(location)

  let { lat, lng } = data

  let Ulat = lat
  let Ulng = lng

  let Rlat = -6.805913599999999
  let Rlng = 39.233126399999996

  let utm = new utmObj()

  let rUtm = utm.convertLatLngToUtm(Rlat, Rlng, 6)

  let uUtm = utm.convertLatLngToUtm(Ulat, Ulng, 6)

  let xU = uUtm.Easting
  let yU = uUtm.Northing

  let xR = rUtm.Easting
  let yR = rUtm.Northing

  const distCalc = (x1, x2, y1, y2) => {
    return Math.sqrt(Math.abs(x1 * x1 - x2 * x2 + (y1 * y1 - y2 * y2)))
  }

  let distanceCheck = distCalc(xU, xR, yU, yR)

  if (totalCost < 5000 && distanceCheck > 1000) {
    delivery_cost = 2000
  } else if (totalCost > 19999 && distanceCheck < 10000) {
    delivery_cost = 0
  } else if (distanceCheck > 30000) {
    delivery_cost = (distanceCheck / 1000) * 50
  } else {
    delivery_cost = 1000
  }

  let parsedFoods = JSON.parse(foods)

  const createNotification = (order) => {
    db.query(notify, [order[0].id, "new order", createdAt], (err, results) => {
      if (err) throw err
      res.json({ msg: "Order placed successful" })
    })
  }

  const uploadOrder = (availablePlates, food) => {
    db.query(
      sql,
      [foods, location, createdAt, orderedBy, 0, 0, delivery_cost],
      (err, output) => {
        if (err) throw err
        if (output && output.insertId) {
          // check for the order in the database
          let orderCheck = `select * from orders where id = '${output.insertId}'`
          let remainPlates = availablePlates - food.plates
          // console.log(remainPlates)
          let updatePlates = `update foods set plates = '${remainPlates}' where id = '${food.id}'`
          db.query(orderCheck, (err, order) => {
            if (err) throw err
            if (order && order.length > 0) {
              db.query(updatePlates, (err, result) => {
                if (err) throw err
                if (result) {
                  createNotification(order)
                }
              })
            }
          })
        } else {
          res.json({
            error: "Couldn't place your order, please try again",
          })
        }
      }
    )
  }

  // console.log(distanceCheck)

  if (!errors.isEmpty()) {
    res.json({ errors: errors.array })
  } else {
    if (distanceCheck <= 500000000) {
      parsedFoods.forEach((food) => {
        // console.log(food)
        let foodCheck = `select * from foods where id = '${food.id}'`
        // checks if food is available
        db.query(foodCheck, (err, output) => {
          if (err) throw err
          // console.log("query stage", output)
          if (output && output.length > 0 && output[0].plates < food.plates) {
            // console.log("this plates stage")
            res.json({ msg: `${food.name} not available right now` })
          } else if (
            output &&
            output.length > 0 &&
            output[0].plates >= food.plates
            // output[0].plates !== null
          ) {
            // checks time
            // console.log(output[0].plates)
            let availablePlates = output[0].plates
            let deliveryTime = food.delivery_time
            let time = new Date(deliveryTime)
            let hour = parseInt(time.getHours())
            // console.log("this stage")
            if (hour < 8 || hour > 21) {
              res.json({ msg: `We are closed during this hours ${hour} ` })
            } else if (8 <= hour <= 21) {
              if (createdAt.getTime() + 1800000 > time.getTime()) {
                res.json({
                  msg: "Error: we need atleast 30 minutes to deliver this food",
                })
              } else {
                uploadOrder(availablePlates, food)
              }
            } else {
              res.json({
                error: "Internal server error",
              })
            }
          } else if (output && output.length === 0) {
            res.json({
              msg: `${food.name} not found`,
            })
          }
        })
      })
    } else {
      res.json({
        error: "Your location isn't covered by our delivery services",
      })
    }
  }

  // if (!errors.isEmpty()) {
  //   res.json({ errors: errors.array() })
  // } else {
  //   if (8 <= hour[0] <= 21) {
  //     console.log(hour[0])
  //     if (createdAt.getTime() + 1800000 > new Date(delivery_time).getTime()) {
  //       res.json({ msg: "Please enter a valid time" })
  //     } else {
  //       console.log(date, time, hour)
  //       if (distanceCheck <= 2000000000) {
  //         db.query(foodCheck, (err, foods) => {
  //           if (err) throw err
  //           if (foods && foods.length > 0) {
  //             if (req.headers && req.headers.authorization) {
  //               let authorization = req.headers.authorization
  //               decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
  //               let userCheck = `select * from users where id = '${decoded.id}'`
  //               db.query(userCheck, (err, output) => {
  //                 if (err) throw err
  //                 if (output && output.length > 0) {
  //                   db.query(
  //                     sql,
  //                     [
  //                       req.params.foodId,
  //                       JSON.stringify(location),
  //                       delivery_time,
  //                       number_of_plates,
  //                       special_description,
  //                       createdAt,
  //                       output[0].name,
  //                       tel,
  //                       address,
  //                       decoded.id,
  //                       0,
  //                       foods[0].name,
  //                     ],
  //                     (err, results) => {
  //                       if (err) throw err
  //                       let orderCheck = `select * from orders where id = '${results.insertId}'`
  //                       db.query(orderCheck, (err, order) => {
  //                         if (err) throw err
  //                         if (order && order.length > 0) {
  //                           db.query(
  //                             notify,
  //                             [
  //                               results.insertId,
  //                               output[0].name,
  //                               output[0].id,
  //                               "New order",
  //                               createdAt,
  //                               foods[0].name,
  //                               order[0].number_of_plates,
  //                               order[0].delivery_time,
  //                             ],
  //                             (err, result) => {
  //                               if (err) throw err
  //                               res.status(200).json({
  //                                 results,
  //                                 result,
  //                                 foods,
  //                                 order,
  //                                 msg: "Order placed successfully",
  //                               })
  //                             }
  //                           )
  //                         } else if (order && order.length === 0) {
  //                           res.json({
  //                             msg:
  //                               "Your request couldn't be processed, please try again",
  //                           })
  //                         } else {
  //                           res.json({
  //                             err:
  //                               "Internal server error, couldn't send a notification",
  //                             msg: "Order placed successfully",
  //                           })
  //                         }
  //                       })
  //                     }
  //                   )
  //                 } else {
  //                   res.status(500).json({ msg: "Internal server error" })
  //                 }
  //               })
  //             } else {
  //               db.query(
  //                 sql,
  //                 [
  //                   req.params.foodId,
  //                   JSON.stringify(location),
  //                   delivery_time,
  //                   number_of_plates,
  //                   special_description,
  //                   createdAt,
  //                   orderedBy,
  //                   tel,
  //                   address,
  //                   null,
  //                   0,
  //                   foods[0].name,
  //                 ],
  //                 (err, results) => {
  //                   if (err) throw err
  //                   let orderCheck = `select * from orders where id = '${results.insertId}'`
  //                   db.query(orderCheck, (err, order) => {
  //                     if (err) throw err
  //                     if (order && order.length > 0) {
  //                       db.query(
  //                         notify,
  //                         [
  //                           results.insertId,
  //                           orderedBy,
  //                           null,
  //                           "New order",
  //                           createdAt,
  //                           foods[0].name,
  //                           order[0].number_of_plates,
  //                           order[0].delivery_time,
  //                         ],
  //                         (err, result) => {
  //                           if (err) throw err
  //                           res.status(200).json({
  //                             results,
  //                             result,
  //                             foods,
  //                             order,
  //                             msg: "Order placed successfully",
  //                           })
  //                         }
  //                       )
  //                     } else if (order && order.length === 0) {
  //                       res.json({
  //                         msg:
  //                           "Your request couldn't be processed, please try again",
  //                       })
  //                     } else {
  //                       res.json({
  //                         err:
  //                           "Internal server error, couldn't send a notification",
  //                         msg: "Order placed successfully",
  //                       })
  //                     }
  //                   })
  //                 }
  //               )
  //             }
  //           } else if (foods && foods.length === 0) {
  //             res
  //               .status(404)
  //               .json({ msg: "Food not found, this order can't be placed" })
  //           } else {
  //             res
  //               .status(500)
  //               .json({ msg: "Internal server error, please try again" })
  //           }
  //         })
  //       } else {
  //         res.json({ msg: "Distance Unreachable" })
  //       }
  //     }
  //   } else if (21 < hour[0] < 0) {
  //     console.log(hour, time)
  //     res.json({ msg: "Closing time" })
  //   }
  // }
}

exports.editOrder = async (req, res) => {
  let decoded

  const {
    location,
    special_description,
    delivery_time,
    number_of_plates,
    tel,
    address,
  } = req.body

  let orderCheck = `select * from orders where id = '${req.params.orderId}'`
  let sql = `update orders set location = '${location}', special_description = '${special_description}', delivery_time = '${delivery_time}', number_of_plates = '${number_of_plates}', tel = '${tel}', address = '${address}' where id = '${req.params.orderId}'`

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    res.json({ errors: errors.array() })
  } else {
    db.query(orderCheck, (err, output) => {
      if (err) throw err
      if (output && output.length > 0) {
        if (req.headers && req.headers.authorization) {
          let authorization = req.headers.authorization
          decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
          if (decoded.id === output[0].userId) {
            db.query(sql, (err, results) => {
              if (err) throw err
              if (results) {
                res
                  .status(200)
                  .json({ results, msg: "Order updated successfully" })
              } else {
                res
                  .status(500)
                  .json({ msg: "Internal server error, please try again" })
              }
            })
          }
        } else {
          res.status(403).json({ msg: "Unauthorized" })
        }
      } else if (output && output.length === 0) {
        res.status(404).json({ msg: "Order not found" })
      } else {
        res.status(500).json({ msg: "Internal server error" })
      }
    })
  }
}

exports.deleteOrder = async (req, res) => {
  let orderCheck = `select * from orders where id = '${req.params.orderId}'`
  let sql = `delete from orders where id = '${req.params.orderId}'`
  let decoded

  db.query(orderCheck, (err, output) => {
    if (err) throw err
    if (output && output.length > 0) {
      if (req.headers && req.headers.authorization) {
        let authorization = req.headers.authorization
        decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
        if (decoded.id === output[0].userId) {
          db.query(sql, (err, results) => {
            if (err) throw err
            if (results) {
              res
                .status(200)
                .json({ results, msg: "Order deleted successfully" })
            } else {
              res
                .status(500)
                .json({ msg: "Internal server error, please try again" })
            }
          })
        }
      } else {
        res.status(403).json({ msg: "Unauthorized" })
      }
    } else if (output && output.length === 0) {
      res.status(404).json({ msg: "Order not found" })
    } else {
      res.status(500).json({ msg: "Internal server error" })
    }
  })
}

exports.getOrders = async (req, res) => {
  let sql = "select * from orders order by id desc"
  let decoded
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (
      (decoded.id && decoded.role === "admin") ||
      decoded.role === "main-admin"
    ) {
      db.query(sql, (err, output) => {
        if (err) throw err
        if (output && output.length > 0) {
          res.status(200).json({ output, msg: "Orders retrieved" })
        } else {
          res.status(500).json({ msg: "No order found" })
        }
      })
    }
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

exports.getOrder = async (req, res) => {
  let sql = `select * from orders where id = '${req.params.orderId}'`
  let decoded
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (
      (decoded.id && decoded.role === "admin") ||
      decoded.role === "main-admin"
    ) {
      db.query(sql, (err, output) => {
        if (err) throw err
        if (output && output.length > 0) {
          res.status(200).json({ output, msg: "Order retrieved" })
        } else if (output && output.length === 0) {
          res.status(404).json({ msg: "Order not found" })
        } else {
          res.status(500).json({ msg: "Internal server error" })
        }
      })
    }
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

exports.myOrders = async (req, res) => {
  let decoded
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    let sql = `select * from orders where userId = '${decoded.id}'`
    db.query(sql, (err, results) => {
      if (err) throw err
      if (results && results.length > 0) {
        res
          .status(200)
          .json({ results, msg: "Your orders were retrieved successfully" })
      } else if (results && results.length === 0) {
        res.status(404).json({ msg: "You didn't place any order" })
      } else {
        res
          .status(500)
          .json({ msg: "Couldn't retrieve your orders, please try again" })
      }
    })
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

exports.markOrderAsDelivered = async (req, res) => {
  let orderCheck = `select * from orders where id = '${req.params.orderId}'`
  let sql = `update orders set delivered = '1' where id = '${req.params.orderId}'`
  let decoded
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (
      (decoded.id && decoded.role === "admin") ||
      decoded.role === "main-admin"
    ) {
      db.query(orderCheck, (err, output) => {
        if (err) throw err
        if (output && output.length > 0) {
          db.query(sql, (err, results) => {
            if (err) throw err
            if (results) {
              res.status(200).json({ results, msg: "Order delivered" })
            } else {
              res.status(500).json({
                msg: "Internal server error, Failed to confirm delivery",
              })
            }
          })
        } else if (output && output.length === 0) {
          res.status(404).json({ msg: "Order not found" })
        } else {
          res.status(500).json({ msg: "Internal server error" })
        }
      })
    }
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

// get user orders
exports.getUserOrders = async (req, res) => {
  let sql = `select * from orders where userId = '${req.params.userId}'`
  let userCheck = `select * from users where id = '${req.params.userId}'`
  let decoded
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (
      (decoded.id && decoded.role === "admin") ||
      decoded.role === "main-admin"
    ) {
      db.query(userCheck, (err, output) => {
        if (err) throw err
        if (output && output.length > 0) {
          db.query(sql, (err, results) => {
            if (err) throw err
            if (results && results.length > 0) {
              res.json({ results })
            } else {
              res.json({ msg: "No orders by this user" })
            }
          })
        } else if (output && output.length === 0) {
          res.json({ msg: "User not found" })
        } else {
          res.json({ error: "Internal server error" })
        }
      })
    }
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

exports.getFoodOrders = async (req, res) => {
  let sql = `select * from orders where foodId = '${req.params.foodId}'`
  let foodCheck = `select * from foods where id = '${req.params.foodId}'`
  let decoded
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (
      (decoded.id && decoded.role === "admin") ||
      decoded.role === "main-admin"
    ) {
      db.query(foodCheck, (err, output) => {
        if (err) throw err
        if (output && output.length > 0) {
          db.query(sql, (err, results) => {
            if (err) throw err
            res.json({ results })
          })
        } else if (output && output.length === 0) {
          res.status(404).json({ msg: "Food not found" })
        } else {
          res.status(500).json({ msg: "Internal server error" })
        }
      })
    }
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

// mark order as pending
exports.markOrderAsPending = async (req, res) => {
  let sql = `update orders set pending = 1 where delivery_time < NOW() and delivered = 0`
  let decoded
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (
      (decoded.id && decoded.role === "admin") ||
      decoded.role === "main-admin"
    ) {
      db.query(sql, (err, results) => {
        if (err) throw err
        if (results) {
          res.json({ results })
        } else {
          res.status(500).json({ msg: "Internal server error" })
        }
      })
    }
  } else {
    res.status(404).json({ msg: "Unauthorized" })
  }
}

// get pending orders
exports.getPendingOrders = async (req, res) => {
  let sql = `select * from orders where pending = 1 and delivered = 0`
  let decoded
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization
    decoded = jwt.verify(authorization, process.env.SECRET_TOKEN)
    if (
      (decoded.id && decoded.role === "admin") ||
      decoded.role === "main-admin"
    ) {
      db.query(sql, (err, results) => {
        if (err) throw err
        if (results && results.length > 0) {
          res.status(200).json({ msg: "Pending orders retrieved", results })
        } else if (results && results.length === 0) {
          res.status(404).json({ msg: "No pending order found" })
        } else {
          res.status(500).json({ msg: "Internal server error" })
        }
      })
    }
  } else {
    res.status(403).json({ msg: "Unauthorized" })
  }
}

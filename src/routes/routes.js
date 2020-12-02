const express = require("express")
const { check } = require("express-validator")
const multer = require("multer")

const router = express.Router()

const verify = require("../auth/veryfyToken")

//controllers
const {
  register,
  login,
  addProfile,
  getUserData,
  getUsers,
  getAdmins,
  addAdmin,
  removeAdmin,
  logout,
  uploadDp,
  passwordRecovery,
  settings,
} = require("../controllers/users")
const {
  addFood,
  getFoods,
  getFeaturedFoods,
  updateFood,
  updateFoodImage,
  deleteFood,
  getFood,
  search,
  setFeaturedFood,
  removeFeaturedFood,
} = require("../controllers/foods")
const {
  placeOrder,
  getOrder,
  getOrders,
  markOrderAsDelivered,
  editOrder,
  deleteOrder,
  myOrders,
  getUserOrders,
  getFoodOrders,
  markOrderAsPending,
  getPendingOrders,
} = require("../controllers/orders")
const { addToCart, myCart, removeFromCart } = require("../controllers/cart")
const {
  notifications,
  // createNotification,
  readNotification,
} = require("../controllers/notifications")

//users
//route to register both admin and customer
router.post(
  "/register",
  [
    [
      check("name", "Please enter your name").trim().isLength({ min: 3 }),
      check("email", "Please include a valid email").isEmail(),
      check("tel", "Please add a valid telephone number")
        .trim()
        .not()
        .isEmpty()
        .isLength({ min: 9 }),
      check("password", "Password with minimum 6 characters is required")
        .trim()
        .isLength({ min: 6 }),
    ],
  ],
  register
)

//route to login both admin and customers
router.post("/login", login)

// password recovery
router.post(
  "/recover-password",
  [check("email", "Please include a valid email").isEmail()],
  passwordRecovery
)

// settings
router.post(
  "/setting",
  [
    check("email", "Please include a valid email").isEmail(),
    check("newEmail", "Please enter a valid email").isEmail(),
    check("password", "Please include a password").trim().isLength({ min: 6 }),
    check("newPassword", "Please include a password")
      .trim()
      .isLength({ min: 6 }),
  ],
  verify,
  settings
)

// add/edit profile
router.post(
  "/profile",
  [check("name", "Please include your name").trim().not().isEmpty()],
  verify,
  addProfile
)

// upload profile image
router.post("/upload-dp", verify, uploadDp)

// get userData
router.get("/auth", verify, getUserData)

// get all users
router.get("/users", verify, getUsers)

//get all admins
router.get("/admins", verify, getAdmins)

//main admin add admin
router.post("/add-admin/:userId", verify, addAdmin)

//main admin removes admins
router.post("/remove-admin/:userId", verify, removeAdmin)

// logout user
router.post("/logout", verify, logout)

// foods
//admin adds food
router.post(
  "/add-food",
  [
    check("name", "Please include food name").trim().not().isEmpty(),
    check("cost", "Please Include cost").trim().not().isEmpty(),
  ],
  verify,
  addFood
)

//admin updates food
router.post(
  "/update-food/:foodId",
  [
    check("name", "Please include food name").trim().not().isEmpty(),
    check("cost", "please include cost of this food").trim().not().isEmpty(),
  ],
  verify,
  updateFood
)

// admin updates foodImage
router.post("/update-food-image/:foodId", verify, updateFoodImage)

//admin deletes food
router.post("/delete-food/:foodId", verify, deleteFood)

// add featured food
router.post("/add-featured-food/:foodId", verify, setFeaturedFood)

// remove featured food
router.post("remove-featured-food/:foodId", verify, removeFeaturedFood)

//retrieves all foods
router.get("/get-foods", getFoods)

//retrieve one food
router.get("/get-food/:foodId", getFood)

router.get("/get-featured-foods", getFeaturedFoods)

//search queries
router.post(
  `/search`,
  [
    check("keyword", "Please enter any keyword to search")
      .trim()
      .not()
      .isEmpty(),
  ],
  search
)

//user places an order
router.post(
  "/order/:foodId",
  [
    check("location", "Please include your location").trim().not().isEmpty(),
    check("delivery_time", "Please add delivery time").trim().not().isEmpty(),
    check("number_of_plates", "Please include number of plates")
      .trim()
      .not()
      .isEmpty(),
    check("tel", "Please include your telephone number").trim().not().isEmpty(),
    // check( "orderedBy", "Please include your name" ).trim().not().isEmpty()
  ],
  placeOrder
)

// orders
// edit order
router.post(
  "/edit-order/:orderId",
  [
    check("location", "Please include your location").trim().not().isEmpty(),
    check("delivery_time", "Please add delivery time").trim().not().isEmpty(),
    check("number_of_plates", "Please include number of plates")
      .trim()
      .not()
      .isEmpty(),
    check("tel", "Please include your telephone number").trim().not().isEmpty(),
  ],
  verify,
  editOrder
)

// delete order
router.post("/delete-order/:orderId", verify, deleteOrder)

//retrieves all orders
router.get("/orders", verify, getOrders)

//gets a specific order
router.get("/order/:orderId", verify, getOrder)

// delivered orders
router.post("/mark-delivered-order/:orderId", verify, markOrderAsDelivered)

// mark order as pending
router.post("/mark-pending-orders", verify, markOrderAsPending)

// get pending orders
router.get("/pending-orders", verify, getPendingOrders)

// get user orders
router.get("/my-orders", verify, myOrders)

// get specific user order
router.get("/user-orders/:userId", verify, getUserOrders)

// get specific food orders
router.get("/food-orders/:foodId", verify, getFoodOrders)

// cart
// add to cart
router.post("/add-to-cart/:foodId", verify, addToCart)

// remove from cart
router.post("/remove-from-cart/:cartId", verify, removeFromCart)

// retrieve my carts
router.get("/my-cart", verify, myCart)

// notifications
// get notifications // admin only
router.get("/notifications", verify, notifications)

// read notification
router.post("/notification/:notificationId", verify, readNotification)

module.exports = router

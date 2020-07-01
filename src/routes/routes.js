const express = require("express")

const router = express.Router()

//routes
const { register} = require("../controllers/user")

//route to register both admin and customer
router.post("/register", register)

//route to login both admin and customers
router.post("/login", (req, res) => {
    res.json({msg: "Login"})
})

//admin adds food
router.post("/add-food", (req, res) => {
    res.json({msg: "food added"})
})

//user places an order
router.post("/order", (req, res) => {
    res.json({msg: "order placed"})
})

//retrieves all foods
router.get("/get-food", (req, res) => {
    res.json({msg: "Foods"})
})

//retrieve one food
router.get("/get-food/:foodId", (req, res) => {
    res.json({msg: "Food"})
})

//search queries
router.get(`/search=`, (req, res) => {
    res.json({msg: "Foods"})
})

//retrieves all orders
router.get("/orders", (req, res) => {
    res.json({msg: "Orders"})
})

//gets a specific order
router.get("/orders/:orderId", (req, res) => {
    res.json({msg: "order retrieved"})
})

module.exports = router
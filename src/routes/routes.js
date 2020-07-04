const express = require( "express" )
const { check } = require( 'express-validator' );

const router = express.Router()

//controllers
const { register, login } = require( "../controllers/user" )

//route to register both admin and customer
router.post( "/register", [
    [
        check( 'name', 'Please enter your name' ).trim().isLength( { min: 3 } ),
        check( 'email', 'Please include a valid email' ).isEmail(),
        check( 'password', 'Password with minimum 6 characters is required' ).trim().isLength( { min: 6 } )
    ]
], register )

//route to login both admin and customers
router.post( "/login", [
    check( 'email', 'Please include a valid email' ).trim().not().isEmpty(),
    check( 'password', 'Password is required' ).trim().not().isEmpty()
], login )

//admin adds food
router.post( "/add-food", ( req, res ) => {
    res.json( { msg: "food added" } )
} )

//user places an order
router.post( "/order", ( req, res ) => {
    res.json( { msg: "order placed" } )
} )

//add admin
router.post( "/add-admin", ( req, res ) => {
    res.json( { msg: "admin added" } )
} )

//retrieves all foods
router.get( "/get-food", ( req, res ) => {
    res.json( { msg: "Foods" } )
} )

//retrieve one food
router.get( "/get-food/:foodId", ( req, res ) => {
    res.json( { msg: "Food" } )
} )

//search queries
router.get( `/search=`, ( req, res ) => {
    res.json( { msg: "Foods" } )
} )

//retrieves all orders
router.get( "/orders", ( req, res ) => {
    res.json( { msg: "Orders" } )
} )

// get all users
router.post( "/users", ( req, res ) => {
    res.json( { msg: "users retrieved" } )
} )

//gets a specific order
router.get( "/orders/:orderId", ( req, res ) => {
    res.json( { msg: "order retrieved" } )
} )

//get all admins
router.get( "/admins", ( req, res ) => {
    res.json( { msg: "admins retrieved" } )
} )

module.exports = router
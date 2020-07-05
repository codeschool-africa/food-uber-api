const express = require( "express" )
const { check } = require( 'express-validator' );

const router = express.Router()

//controllers
const { register, login, addProfile, getUsers, getAdmins, addAdmin, removeAdmin } = require( "../controllers/user" )
const { addFood, getFoods, getFeaturedFoods, placeOrder, updateFood, deleteFood } = require( "../controllers/product" )

//route to register both admin and customer
router.post( "/register", [
    [
        check( 'name', 'Please enter your name' ).trim().isLength( { min: 3 } ),
        check( 'email', 'Please include a valid email' ).isEmail(),
        check( "tel", "Please add a valid telephone number" ).trim().not().isEmpty().isLength( { min: 9 } ),
        check( 'password', 'Password with minimum 6 characters is required' ).trim().isLength( { min: 6 } )
    ]
], register )

//route to login both admin and customers
router.post( "/login", [
    check( 'email', 'Please include a valid email' ).trim().not().isEmpty(),
    check( 'password', 'Password is required' ).trim().not().isEmpty()
], login )

//admin adds food
router.post( "/add-food", addFood )

//admin updates food
router.post( "/update-food", updateFood )

//admin deletes food
router.post( "/add-food", deleteFood )

//user places an order
router.post( "/order", placeOrder )

//add admin
router.post( "/add-admin", ( req, res ) => {
    res.json( { msg: "admin added" } )
} )

//retrieves all foods
router.get( "/get-foods", getFoods )

//retrieve one food
router.get( "/get-food/:foodId", ( req, res ) => {
    res.json( { msg: "Food" } )
} )

router.get( "/get-featured-foods", getFeaturedFoods )

//search queries
router.get( `/search=`, ( req, res ) => {
    res.json( { msg: "Foods" } )
} )

//retrieves all orders
router.get( "/orders", ( req, res ) => {
    res.json( { msg: "Orders" } )
} )

// get all users
router.get( "/users", getUsers )

//gets a specific order
router.get( "/orders/:orderId", ( req, res ) => {
    res.json( { msg: "order retrieved" } )
} )

//get all admins
router.get( "/admins", getAdmins )

//main admin add admin
router.post( "/add-admin", addAdmin )

//main admin removes admins
router.post( "/remove-admin", removeAdmin )

// add/edit profile
router.post( "/profile", addProfile )


module.exports = router
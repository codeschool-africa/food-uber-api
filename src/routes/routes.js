const express = require( "express" )
const { check } = require( 'express-validator' );

const router = express.Router()

//controllers
const { register, login, addProfile, getUsers, getAdmins, addAdmin, removeAdmin, logout, uploadDp } = require( "../controllers/user" )
const { addFood, getFoods, getFeaturedFoods, updateFood, deleteFood, getFood, searchFood, uploadFoodImage, } = require( "../controllers/product" )
const { placeOrder, getOrder, getOrders, markOrderAsDelivered, editOrder, deleteOrder } = require( "../controllers/orders" )

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

// logout user
router.post( "/logout", logout )

//admin adds food
router.post( "/add-food", [
    check( 'name', "Please include food name" ).trim().not().isEmpty(),
    check( "cost", "Please Include cost" ).trim().not().isEmpty()
], addFood )

//admin updates food
router.post( "/update-food/:foodId", updateFood )

//admin deletes food
router.post( "/delete-food/:foodId", deleteFood )

//retrieves all foods
router.get( "/get-foods", getFoods )

//retrieve one food
router.get( "/get-food/:foodId", getFood )

router.get( "/get-featured-foods", getFeaturedFoods )

//search queries
router.get( `/search/:query`, searchFood )

//user places an order
router.post( "/order/:foodId", placeOrder )

// edit order
router.post( "/edit-order/:orderId", editOrder )

// delete order
router.post( "/delete-order/:orderId", deleteOrder )

//retrieves all orders
router.get( "/orders", getOrders )

//gets a specific order
router.get( "/order/:orderId", getOrder )

// delivered orders
router.post( "/mark-delivered-order/:orderId", markOrderAsDelivered )

// get all users
router.get( "/users", getUsers )

//get all admins
router.get( "/admins", getAdmins )

//main admin add admin
router.post( "/add-admin/:userId", addAdmin )

//main admin removes admins
router.post( "/remove-admin/:userId", removeAdmin )

// add/edit profile
router.post( "/profile", addProfile )

// upload profile image
router.post( "/upload-dp", uploadDp )

// upload food-image
router.post( "/upload-food-image", uploadFoodImage )


module.exports = router
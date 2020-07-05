const { validationResult } = require( 'express-validator' );
const db = require( "../models/db" )

exports.placeOrder = async ( req, res ) => {
    res.json( { msg: "order placed" } )
}

exports.getOrders = async ( req, res ) => {
    res.json( { msg: "Orders retrieved" } )
}

exports.getOrder = async ( req, res ) => {
    res.json( { msg: 'order retrieved' } )
}
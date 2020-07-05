const { validationResult } = require( 'express-validator' );
const db = require( "../models/db" )

exports.placeOrder = async ( req, res ) => {
    const { location, special_description, delivery_time, number_of_plates, tel, orderedBy, address } = req.body
    const errors = validationResult( req )
    let createdAt = new Date()

    let sql = `insert into orders values (id,?,?,?,?,?,?,?,?,?,?)`

    let foodCheck = `select * from foods where id = '${req.params.foodId}'`

    if ( !errors.isEmpty() ) {
        res.json( { errors: errors.array() } )
    } else {
        db.query( foodCheck, ( err, results ) => {
            if ( err ) throw err
            if ( results && results.length > 0 ) {
                if ( req.session.isLoggedIn && req.session.userId ) {
                    let userCheck = `select * from users where id = '${req.session.userId}'`
                    db.query( userCheck, ( err, output ) => {
                        if ( err ) throw err
                        if ( output && output.length > 0 ) {
                            db.query( sql, [req.params.foodId, location, delivery_time, number_of_plates, special_description, createdAt, output[0].name, tel, address, req.session.userId], ( err, results ) => {
                                if ( err ) throw err
                                res.status( 200 ).json( { results, msg: 'Order placed successfully' } )
                            } )
                        } else {
                            res.status( 500 ).json( { msg: "Internal server error" } )
                        }
                    } )
                } else {
                    db.query( sql, [req.params.foodId, location, delivery_time, number_of_plates, special_description, createdAt, orderedBy, tel, address, null], ( err, results ) => {
                        if ( err ) throw err
                        res.status( 200 ).json( { results, msg: 'Order placed successfully' } )
                    } )
                }
            } else if ( results && results.length === 0 ) {
                res.status( 404 ).json( { msg: "Food not found, this order can't be placed" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error, please try again" } )
            }
        } )
    }
}

exports.getOrders = async ( req, res ) => {
    let sql = "select * from orders order by id desc"
    if ( req.session.isLoggedIn && ( req.session.role === "admin" || "main-admin" ) ) {
        db.query( sql, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                res.status( 200 ).json( { output, msg: "Orders retrieved" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

exports.getOrder = async ( req, res ) => {
    res.json( { msg: 'order retrieved' } )
}
const { validationResult } = require( 'express-validator' );
const db = require( "../models/db" )

exports.addToCart = async ( req, res ) => {
    let sql = `insert into carts values (id,?,?,?,?)`
    let foodCheck = `select * from foods where id = '${req.params.foodId}'`
    let userCheck = `select * from users where id = '${req.session.userId}'`
    let cartCheck = `select * from carts where foodId = '${req.params.foodId}' and userId = '${req.session.userId}'`

    let createdAt = new Date()

    if ( req.session.isLoggedIn && req.session.userId ) {
        db.query( userCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                db.query( foodCheck, ( err, result ) => {
                    if ( err ) throw err
                    if ( result && result.length > 0 ) {
                        db.query( cartCheck, ( err, outputs ) => {
                            if ( err ) throw err
                            if ( outputs && outputs.length > 0 ) {
                                res.status( 400 ).json( { msg: "Food already added to cart" } )
                            } else if ( outputs && outputs.length === 0 ) {
                                // console.log( result )
                                db.query( sql, [req.params.foodId, result[0].name, req.session.userId, createdAt], ( err, results ) => {
                                    if ( err ) throw err
                                    if ( results ) {
                                        res.status( 200 ).json( { results, msg: "Food added to cart" } )
                                    } else {
                                        res.json( { msg: "Your request couldn't be processed,  please try again" } )
                                    }
                                } )
                            } else {
                                res.status( 500 ).json( { msg: "Internal server error" } )
                            }
                        } )
                    } else if ( result && result.length === 0 ) {
                        res.status( 404 ).json( { msg: "Food not found" } )
                    } else {
                        res.status( 500 ).json( { msg: "Internal server error" } )
                    }
                } )
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "User with your credentials could't be found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

exports.removeFromCart = async ( req, res ) => {
    let cartCheck = `select * from carts where id = '${req.params.cartId}'`
    let sql = `delete from carts where id = '${req.params.cartId}'`

    if ( req.session.userId && req.session.isLoggedIn ) {
        db.query( cartCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && ( output.length > 0 && output[0].userId === req.session.userId ) ) {
                db.query( sql, ( err, results ) => {
                    if ( err ) throw err
                    if ( results ) {
                        res.status( 200 ).json( { results, msg: "Cart deleted successfully" } )
                    } else {
                        res.status( 500 ).json( { msg: "Internal server error, please try again" } )
                    }
                } )
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "Cart not found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

exports.myCart = async ( req, res ) => {
    let sql = `select * from carts where userId = '${req.session.userId}'`
    if ( req.session.isLoggedIn && req.session.userId ) {
        db.query( sql, ( err, results ) => {
            if ( err ) throw err
            if ( results && results.length > 0 ) {
                res.status( 200 ).json( { results, msg: "Your cart were retrieved successfully" } )
            } else if ( results && results.length === 0 ) {
                res.status( 404 ).json( { msg: "You didn't add any food to cart" } )
            } else {
                res.status( 500 ).json( { msg: "Couldn't retrieve your cart, please try again" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

// to do, will add image so when retrieved will come with everything
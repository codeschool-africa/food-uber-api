const { validationResult } = require( 'express-validator' );
const db = require( "../models/db" )

exports.addFood = async ( req, res ) => {
    const { name, description, category, cost, featured } = req.body
    let createdAt = new Date()
    let adminId = req.session.userId
    let sql = `INSERT INTO foods values (uuid(),?,?,?,?,?,?,?)`
    if ( req.session.isLoggedIn && ( req.session.role === "main-admin" || "admin" ) ) {
        db.query( sql, [name, description, category, cost, featured, createdAt, adminId], ( err, results ) => {
            if ( err ) throw err
            if ( results ) {
                res.json( { results, msg: "Food added successful" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

exports.updateFood = async ( req, res ) => {
    res.json( { msg: "food updated" } )
}

exports.deleteFood = async ( req, res ) => {
    res.json( { msg: "food deleted" } )
}

exports.getFoods = async ( req, res ) => {
    let sql = "select * from foods ORDER BY createdAt"
    db.query( sql, ( err, results ) => {
        if ( err ) throw err
        if ( results && results.length > 0 ) {
            res.status( 200 ).json( { results } )
        } else if ( results && results.length === 0 ) {
            res.status( 500 ).json( { msg: "No food found" } )
        } else {
            res.status( 500 ).json( { msg: "Internal server error" } )
        }
    } )
}

exports.getFeaturedFoods = async ( req, res ) => {
    let sql = "select * from foods where featured=1 ORDER BY createdAt"
    db.query( sql, ( err, results ) => {
        if ( err ) throw err
        if ( results && results.length > 0 ) {
            res.status( 200 ).json( { results } )
        } else if ( results && results.length === 0 ) {
            res.status( 500 ).json( { msg: "No food found" } )
        } else {
            res.status( 500 ).json( { msg: "Internal server error" } )
        }
    } )
}

exports.placeOrder = async ( req, res ) => {
    res.json( { msg: "order placed" } )
}
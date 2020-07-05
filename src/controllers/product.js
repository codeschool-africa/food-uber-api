const { validationResult } = require( 'express-validator' );
const db = require( "../models/db" )

// add food by admin
exports.addFood = async ( req, res ) => {
    const { name, description, category, cost, featured } = req.body
    const errors = validationResult( req )
    let createdAt = new Date()
    let adminId = req.session.userId
    let sql = `INSERT INTO foods values (id,?,?,?,?,?,?,?)`

    if ( req.session.isLoggedIn && ( req.session.role === "main-admin" || "admin" ) ) {
        if ( !errors.isEmpty() ) {
            res.json( { errors: errors.array() } )
        } else {
            db.query( sql, [name, description, category, cost, featured, createdAt, adminId], ( err, results ) => {
                if ( err ) throw err
                if ( results ) {
                    res.json( { results, msg: "Food added successful" } )
                } else {
                    res.status( 500 ).json( { msg: "Internal server error" } )
                }
            } )
        }
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

// update food by admin
exports.updateFood = async ( req, res ) => {
    const { name, description, category, cost, featured } = req.body
    // let adminId = req.session.userId
    let sql = `update foods set name = '${name}', description = '${description}', category = '${category}', cost = '${cost}', featured = '${featured}' where id = '${req.params.foodId}'`
    if ( req.session.isLoggedIn && ( req.session.role === "main-admin" || "admin" ) ) {
        db.query( sql, ( err, results ) => {
            if ( err ) throw err
            if ( results ) {
                res.json( { results, msg: "Food updated successful" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

// delete food by admin
exports.deleteFood = async ( req, res ) => {
    let sql = `delete from foods where id = '${req.params.foodId}'`
    let foodIdCheck = `select * from foods where id = '${req.params.foodId}'`
    if ( req.session.isLoggedIn && ( req.session.role === "main-admin" || "admin" ) ) {
        db.query( foodIdCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                db.query( sql, ( err, results ) => {
                    if ( err ) throw err
                    if ( results ) {
                        res.json( { results, msg: "Food deleted successful" } )
                    } else {
                        res.status( 500 ).json( { msg: "internal server error" } )
                    }
                } )
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: 'Food not found' } )
            } else {
                res.status( 500 ).json( { msg: "Ingternal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: 'Unauthorized' } )
    }
}

// get all foods
exports.getFoods = async ( req, res ) => {
    let sql = "select * from foods ORDER BY createdAt desc"
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

// get featured foods
exports.getFeaturedFoods = async ( req, res ) => {
    let sql = "select * from foods where featured=1 ORDER BY createdAt desc"
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

// gets single food by id
exports.getFood = async ( req, res ) => {
    let sql = "select * from foods where id = '" + req.params.foodId + "'"
    db.query( sql, ( err, results ) => {
        if ( err ) throw err
        if ( results && results.length > 0 ) {
            res.json( { results } )
        } else if ( results && results.length === 0 ) {
            res.status( 404 ).json( { msg: "Food not found" } )
        } else {
            res.status( 500 ).json( { msg: "Internal server error" } )
        }
    } )
}

exports.searchFood = async ( req, res ) => {
    res.json( { msg: "Food searched" } )
}
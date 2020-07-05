const bcrypt = require( "bcryptjs" )
const { validationResult } = require( 'express-validator' );
// const nodemailer = require( "nodemailer" )
const db = require( "../models/db" )

let salt = bcrypt.genSaltSync( 12 );

//register customer with email
exports.register = async ( req, res ) => {

    const { name, email, tel, password } = req.body

    const errors = validationResult( req )

    //hashes password
    let hashedpassword = await bcrypt.hash( password, salt );

    let createdAt = new Date()

    let emailCheck = "SELECT * from users where email = '" + email + "'"

    if ( !errors.isEmpty() ) {
        res.json( { errors: errors.array() } )
    }
    else {
        //checks if email exists
        db.query( emailCheck, ( err, results ) => {
            if ( err ) throw err
            if ( results.length > 0 ) {
                res.status( 400 ).json( { error: "email address already in use" } )
            }
            else {
                //add user
                let sql = `INSERT INTO users values (uuid(),?,?,?,?, null,?, false)`
                db.query( sql, [name, email, tel, hashedpassword, createdAt], ( err, result ) => {
                    if ( err ) throw err
                    if ( result ) {
                        db.query( emailCheck, ( err, output ) => {
                            if ( err ) throw err
                            req.session.userId = output[0].id
                            req.session.role = output[0].role
                            req.session.isLoggedIn = true
                            req.session.email = email
                            res.json( { output, session: req.session } )
                        } )
                        // res.json( { msg: "succeeded" } )
                    } else {
                        res.status( 500 ).json( { result, msg: "Internal server error" } )
                    }
                } )
            }
        } )
    }
}

//login customer with telephone or email
exports.login = async ( req, res ) => {
    let { email, password } = req.body
    let sql = "SELECT * from users where email = '" + email + "'"

    const errors = validationResult( req )

    if ( !errors.isEmpty() ) {
        res.json( { errors: errors.array() } )
    } else {
        db.query( sql, async ( err, result ) => {
            if ( err ) throw err
            if ( result.length > 0 ) {
                let hashedpassword = result[0].password
                let isMatch = await bcrypt.compare( password, hashedpassword )
                if ( isMatch ) {
                    req.session.isLoggedIn = true
                    req.session.userId = result[0].id
                    req.session.role = result[0].role
                    req.session.email = email
                    res.status( 200 ).json( { result, session: req.session } )
                } else {
                    res.status( 400 ).json( { msg: "Wrong Credentials" } )
                }
            } else {
                res.status( 500 ).json( { msg: "Wrong Credentials" } )
            }
        } )
    }
}

exports.addProfile = async ( req, res ) => {
    if ( req.session.isLoggedIn === true ) {
        let sql = "SELECT * from users where id = '" + req.session.userId + "'"
        db.query( sql, ( err, results ) => {
            if ( err ) throw err
            res.json( { results } )
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

exports.getUsers = async ( req, res ) => {
    let sql = "select * from users"
    let session = req.session
    console.log( session )
    if ( session.isLoggedIn && session.role === "admin" ) {
        db.query( sql, ( err, results ) => {
            if ( err ) throw err
            if ( results && results.length > 0 ) {
                res.status( 200 ).json( { results } )
            } else if ( results && results.length === 0 ) {
                res.status( 500 ).json( { msg: "No user found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

exports.getAdmins = async ( req, res ) => {
    let sql = `select * from users where role=admin`
    db.query( sql, ( err, results ) => {
        if ( err ) throw err
        if ( results && results.length > 0 ) {
            res.status( 200 ).json( { results } )
        } else if ( results && results.length === 0 ) {
            res.status( 500 ).json( { msg: "No user found" } )
        } else {
            res.status( 500 ).json( { msg: "Internal server error" } )
        }
    } )
}

exports.addAdmin = async ( req, res ) => {
    res.json( { msg: "admin added" } )
}

exports.removeAdmin = async ( req, res ) => {
    res.json( { msg: "admin removed" } )
}

//add main-admin role to add/delete admins
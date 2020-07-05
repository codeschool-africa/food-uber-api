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
                            res.json( { output, session: req.session } )
                        } )
                    } else {
                        res.status( 500 ).json( { result, msg: "Internal server error" } )
                    }
                } )
            }
        } )
    }
}

//login customer with email
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
    let sql = "select * from users order by createdAt desc"
    let session = req.session
    if ( session.isLoggedIn && ( session.role === "admin" || "main-admin" ) ) {
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
    let sql = `select * from users where role = 'admin' order by createdAt desc`
    let session = req.session
    if ( session.isLoggedIn && ( session.role === "main-admin" ) ) {
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

exports.addAdmin = async ( req, res ) => {
    let userCheck = `select * from users where id = '${req.params.userId}'`
    let sql = `update users set role = 'admin' where id = '${req.params.userId}'`
    db.query( userCheck, ( err, output ) => {
        if ( err ) throw err
        if ( output && output.length > 0 ) {
            db.query( sql, ( err, results ) => {
                if ( err ) throw err
                res.status( 200 ).json( { results, msg: "Admin added" } )
            } )
        } else if ( output && output.length === 0 ) {
            res.status( 404 ).json( { msg: "User not found" } )
        } else {
            res.status( 500 ).json( { msg: "Internal server error" } )
        }
    } )
}

exports.removeAdmin = async ( req, res ) => {
    let userCheck = `select * from users where id = '${req.params.userId}'`
    let sql = `update users set role = 'null' where id = '${req.params.userId}'`
    db.query( userCheck, ( err, output ) => {
        if ( err ) throw err
        if ( output && output.length > 0 ) {
            db.query( sql, ( err, results ) => {
                if ( err ) throw err
                res.status( 200 ).json( { results, msg: "Admin removed" } )
            } )
        } else if ( output && output.length === 0 ) {
            res.status( 404 ).json( { msg: "User not found" } )
        } else {
            res.status( 500 ).json( { msg: "Internal server error" } )
        }
    } )
}

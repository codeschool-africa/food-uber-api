const bcrypt = require( "bcryptjs" )

const { validationResult } = require( 'express-validator' );

const db = require( "../models/db" )

let salt = bcrypt.genSaltSync( 12 );

//register customer with email and telephone number
exports.register = async ( req, res ) => {

    const { name, email, tel, password } = req.body

    const errors = validationResult( req )

    //hashes password
    let hashedpassword = await bcrypt.hash( password, salt );

    let createdAt = new Date()

    let emailCheck = "SELECT email from users where email = '" + email + "'"
    let telCheck = "SELECT * from users where tel = '" + tel + "'"

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
                // checks if telephone exists
                db.query( telCheck, ( err, result ) => {
                    if ( err ) throw err
                    if ( result.length > 0 ) {
                        res.status( 400 ).json( { error: "telephone number already in use" } )
                    } else {
                        //add normal user
                        let sql = `INSERT INTO users values (uuid(),?,?,?,?, null,?)`
                        db.query( sql, [name, email, tel, hashedpassword, createdAt], ( err, result ) => {
                            if ( err ) throw err
                            res.json( { result, msg: "not an admin" } )
                        } )

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
                    res.status( 200 ).json( { result } )
                } else {
                    res.status( 400 ).json( { msg: "wrong credentials" } )
                }
            } else {
                res.status( 500 ).json( { msg: "Internal Server Error" } )
            }
        } )
    }
}
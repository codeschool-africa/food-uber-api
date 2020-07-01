const bcrypt = require( "bcryptjs" )

const { body, validationResult } = require( 'express-validator' );

const db = require( "../models/db" )

let salt = bcrypt.genSaltSync( 12 );

//register customer with email and telephone number
exports.register = async ( req, res ) => {

    const { name, email, tel, password } = req.body

    //validate user data
    //todo

    //hashes password
    let hashedpassword = await bcrypt.hash( password, salt );

    let emailCheck = "SELECT email from customers where email = '" + email + "'"
    let telCheck = "SELECT * from customers where tel = '" + tel + "'"

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
                    // registering user 
                    if ( email === "" ) {
                        //add main admin
                        let sql = "INSERT INTO `admin` values (uuid(),?,?,?,?)"
                        db.query( sql, [name, email, tel, hashedpassword], ( err, result ) => {
                            if ( err ) throw err
                            res.json( { result, msg: "admin" } )
                        } )
                    } else {
                        //add normal user
                        let sql = "INSERT INTO `customers` values (uuid(),?,?,?,?)"
                        db.query( sql, [name, email, tel, hashedpassword], ( err, result ) => {
                            if ( err ) throw err
                            res.json( { result, msg: "not an admin" } )
                        } )
                    }
                }
            } )
        }
    } )

}

//login customer with telephone or email
exports.login = ( req, res ) => {
    let { email, password } = req.body
    let sql = "SELECT email from customers where email = '" + email + "'"
    let adminsql = "SELECT email from admin where email = '" + email + "'"

    db.query( adminsql, ( err, result ) => {
        if ( err ) throw err
        if ( result.length > 0 ) {
            res.json( { result, msg: "admin" } )
        } else {
            db.query( sql, ( err, results ) => {
                if ( err ) throw err
                if ( results.length > 0 ) {
                    res.json( { results, msg: "not admin" } )
                } else {
                    res.json( { msg: "wrong credentials" } )
                }
            } )
        }
    } )
}

const bcrypt = require( "bcryptjs" )

const { body, validationResult } = require( 'express-validator' );

const db = require( "../models/db" )

let salt = bcrypt.genSaltSync( 12 );

//register customer with email and telephone number
exports.register = async ( req, res ) => {

    //validate user data


    //gets password from the client
    let pass = req.body.password

    //hashes password
    let hashedpassword = await bcrypt.hash( pass, salt );

    // setting new user data
    let newUser = {
        name: req.body.name,
        email: req.body.email,
        tel: req.body.tel,
        password: hashedpassword
    }

    //destructuring data
    const { name, email, tel, password } = newUser

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
                    let sql = "INSERT INTO `customers` values (uuid(),?,?,?,?)"
                    db.query( sql, [name, email, tel, password], ( err, result ) => {
                        if ( err ) throw err
                        res.json( result )
                    } )
                }
            } )
        }
    } )

}

// //login customer with telephone or email
// exports.login = ( req, res ) => {

// }

// // login admin with email && password
// exports.adminLogin = ( req, res ) => {

// }
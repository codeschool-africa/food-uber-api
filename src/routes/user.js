const bcrypt = require( "bcryptjs" )

const expressValidator = require( "express-validator" )

const db = require( "../models/db" )

let salt = bcrypt.genSaltSync( 12 );

//register customer with email and telephone number
exports.register = async ( req, res ) => {

    //gets password from the client
    let pass = req.body.password

    //hashes password
    let hashedpassword = await bcrypt.hash( pass, salt );

    // setting new user data
    let newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        tel: req.body.tel,
        location: req.body.location,
        password: hashedpassword
    }

    //destructuring data
    const { firstName, lastName, email, tel, location, password } = newUser

    let emailCheck = "SELECT email from sellers where email = '" + email + "'"
    let telCheck = "SELECT * from sellers where tel = '" + tel + "'"

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
                    let sql = "INSERT INTO `sellers` values (uuid(),?,?,?,?,?,?)"
                    db.query( sql, [firstName, lastName, email, tel, location, password], ( err, result ) => {
                        if ( err ) throw err
                        res.json( result )
                    } )
                }
            } )
        }
    } )

}

//login customer with telephone or email
exports.login = ( req, res ) => {

}

// login admin with email && password
exports.adminLogin = (req, res) => {
    
}
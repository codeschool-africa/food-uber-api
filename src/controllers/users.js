const bcrypt = require( "bcryptjs" )
const { validationResult, check } = require( 'express-validator' );
const multer = require( "multer" )
const path = require( "path" )
const db = require( "../models/db" )
const transporter = require( "../models/mailTransporter" )

let salt = bcrypt.genSaltSync( 12 );

//register user with email
exports.register = async ( req, res ) => {

    const { name, email, tel, password } = req.body

    const errors = validationResult( req )

    //hashes password
    let hashedpassword = await bcrypt.hash( password, salt );

    let createdAt = new Date()

    let emailCheck = "SELECT email from users where email = '" + email + "'"

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
                let sql = `INSERT INTO users values (uuid(),?,?,?,?, null,?, false,null, null,null)`
                db.query( sql, [name, email, tel, hashedpassword, createdAt], ( err, result ) => {
                    if ( err ) throw err
                    if ( result ) {
                        db.query( emailCheck, ( err, output ) => {
                            if ( err ) throw err
                            req.session.userId = output[0].id
                            req.session.role = output[0].role
                            req.session.isLoggedIn = true
                            transporter.sendMail(
                                {
                                    to: email,
                                    subject: "Welcome to Faraja food uber",
                                    html: `<p>Hello ${name}, welcome to faraja food uber, login and start exploring our best foods available</p>`
                                },
                                ( error, info ) => {
                                    if ( error ) {
                                        // console.log( error )
                                        res.json( { error: `Error: ${error}`, msg: "Your account was created successfully" } )
                                    } else {
                                        // console.log( info )
                                        res.json( { msg: `Your account was registered successfully, check your email`, output } )
                                    }
                                }
                            )
                        } )
                    } else {
                        res.status( 500 ).json( { result, msg: "Internal server error" } )
                    }
                } )
            }
        } )
    }
}

//login user with email
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
                    res.status( 200 ).json( { results: { email: result[0].email, name: result[0].name, dp_path: result[0].dp_path, location: result[0].location, tel: result[0].tel, role: result[0].role, address: result[0].address, createdAt: result[0].createdAt }, session: req.session } )
                } else {
                    res.status( 400 ).json( { msg: "Wrong Credentials" } )
                }
            } else {
                res.status( 500 ).json( { msg: "Wrong Credentials" } )
            }
        } )
    }
}

// forgot password
exports.passwordRecovery = async ( req, res ) => {
    let errors = validationResult( req )
    let { email } = req.body
    let password = `${Math.floor( Math.random() * 10000000 + 1 )}`
    let hashedpassword = await bcrypt.hash( password, salt );
    let sql = `update users set password = '${hashedpassword}' where email = '${email}'`
    let emailCheck = `SELECT * from users where email = '${email}'`

    if ( !errors.isEmpty() ) {
        res.json( { errors: errors.array() } )
    } else {
        db.query( emailCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                // update user password
                console.log( output )
                db.query( sql, ( err, results ) => {
                    if ( err ) throw err
                    if ( results ) {
                        transporter.sendMail(
                            {
                                to: email,
                                subject: "Password recovery",
                                html: `<p>Hello <strong>${output[0].name}</strong>, your new password is ${password}<br /> <br />
                                    You can change the password while you're logged in anytime
                                </p>`
                            },
                            ( error, info ) => {
                                if ( !error ) {
                                    res.json( { results, msg: `An email was sent to ${email}` } )
                                } else {
                                    res.json( { results, msg: `Error: ${error}` } )
                                }
                            }
                        )
                    }
                    else {
                        res.status( 500 ).json( { msg: "Internal server error, please try again" } )
                    }
                } )
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: `${email} wasn't registered, please register.` } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error, please try again" } )
            }
        } )
    }
}

// logout user
exports.logout = async ( req, res ) => {
    if ( req.session.isLoggedIn === true ) {
        req.session.isLoggedIn = false
        req.session.userId = null
        req.session.role = null
        res.status( 200 ).json( { msg: "Logged out successfully" } )
    } else {
        res.status( 500 ).json( { msg: "You are not logged in" } )
    }
}

// add/edit profile by authenticated user
exports.addProfile = async ( req, res ) => {
    const { name, tel, location, homeAddress } = req.body
    let userCheck = "SELECT * from users where id = '" + req.session.userId + "'"
    let sql = `update users set name = '${name}', tel = '${tel}', location = '${location}', address = '${homeAddress}' where id = '${req.session.userId}'`
    if ( req.session.isLoggedIn === true && req.session.userId ) {
        db.query( userCheck, ( err, results ) => {
            if ( err ) throw err
            if ( results && results.length > 0 ) {
                db.query( sql, ( err, output ) => {
                    if ( err ) throw err
                    if ( output ) {
                        res.status( 200 ).json( { output, msg: "Profile updated" } )
                    } else {
                        res.status( 500 ).json( { msg: 'internal server error' } )
                    }
                } )
            } else if ( results && results.length === 0 ) {
                res.status( 404 ).json( { msg: "User not found" } )
            } else {
                res.status( 500 ).json( { msg: 'Internal server error' } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

// settings 
// change email/password
exports.settings = async ( req, res ) => {
    const { email, newEmail, password, newPassword } = req.body
    let errors = validationResult( req )

    let newHashedPassword = await bcrypt.hash( newPassword, salt );

    let userCheck = `SELECT * from users where email = '${email}'`
    let emailCheck = `SELECT * from users where email = '${newEmail}'`
    let sql = `update users set email = '${newEmail}', password = '${newHashedPassword}' where id = '${req.session.userId}'`

    if ( req.session.isLoggedIn && req.session.userId ) {
        if ( !errors.isEmpty() ) {
            res.json( { errors: errors.array() } )
        } else {
            db.query( userCheck, async ( err, result ) => {
                if ( err ) throw err
                if ( result && result.length > 0 ) {
                    let hashedpassword = result[0].password
                    let isMatch = await bcrypt.compare( password, hashedpassword )
                    if ( isMatch ) {
                        if ( newEmail === email ) {
                            db.query( sql, ( err, results ) => {
                                if ( err ) throw err
                                if ( results ) {
                                    res.json( { results } )
                                } else {
                                    res.status( 500 ).json( { msg: "Internal server error" } )
                                }
                            } )
                        } else if ( newEmail != email ) {
                            db.query( emailCheck, ( err, output ) => {
                                if ( err ) throw err
                                if ( output && output.length > 0 ) {
                                    res.status( 403 ).json( { msg: "Email already in use" } )
                                } else if ( output && output.length === 0 ) {
                                    db.query( sql, ( err, results ) => {
                                        if ( err ) throw err
                                        if ( results ) {
                                            res.json( { results } )
                                        } else {
                                            res.status( 500 ).json( { msg: "Internal server error" } )
                                        }
                                    } )
                                } else {
                                    res.status( 500 ).json( { msg: 'Internal server error, please try again' } )
                                }
                            } )
                        }
                    } else if ( result && result.length === 0 ) {
                        res.status( 403 ).json( { msg: "Wrong Credentials" } )
                    } else {
                        res.status( 500 ).json( { msg: "Internal server error" } )
                    }
                } else {
                    res.status( 500 ).json( { msg: "Wrong Credentials" } )
                }
            } )
        }
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

// upload profile image
exports.uploadDp = async ( req, res ) => {
    // create storage
    const storage = multer.diskStorage( {
        destination: ( req, file, cb ) => {
            cb( null, "./public/assets/uploads/dp/" )
        },
        filename: ( req, file, cb ) => {
            cb( null, file.fieldname + '-' + Date.now() + path.extname( file.originalname ) );
        }
    } )

    // init upload variable
    const upload = multer( {
        storage: storage,
        limits: { fileSize: 10000000 },
        fileFilter: ( req, file, cb ) => {
            checkFileType( file, cb )
        }
    } ).single( 'dp' );

    // check file type
    const checkFileType = ( file, cb ) => {
        // allowed extenstion
        const filetypes = /jpeg|jpg|png/
        // check the ext
        const extname = filetypes.test( path.extname( file.originalname ).toLowerCase() )

        // mimetype
        const mimetype = filetypes.test( file.mimetype )

        if ( extname && mimetype ) {
            return cb( null, true )
        } else {
            return cb( 'Upload .png, .jpg and .jpeg only' )
        }
    }

    let userCheck = `select * from users where id = '${req.session.userId}'`

    if ( req.session.isLoggedIn && req.session.userId ) {
        db.query( userCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                upload( req, res, err => {
                    if ( err instanceof multer.MulterError ) {
                        res.json( { msg: `${err}` } )
                    } else if ( err ) {
                        res.json( { msg: `${err}` } )
                    } else {
                        let sql = `update users set dp_path = '${req.file.name}' where id = '${req.session.userId}'`
                        db.query( sql, ( err, results ) => {
                            if ( err ) throw err
                            if ( results ) {
                                res.status( 200 ).json( { results, msg: "Image was uploaded successful" } )
                            } else {
                                res.status( 500 ).json( { msg: "Internal server error" } )
                            }
                        } )
                    }
                } )
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "User not found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error, please try again" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

// get users on admins profile
exports.getUsers = async ( req, res ) => {
    let sql = "select name, email, tel, role, location, dp_path, address from users order by createdAt desc"
    let session = req.session
    if ( session.isLoggedIn && session.role === "admin" || session.role === "main-admin" ) {
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

// get all admins in main-admins profile
exports.getAdmins = async ( req, res ) => {
    let sql = `select name, email, tel, role, location, dp_path, address from users where role = 'admin' order by createdAt desc`
    let session = req.session
    if ( session.isLoggedIn && session.role === "main-admin" ) {
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

// main-admin adds admin from users registered
exports.addAdmin = async ( req, res ) => {
    let userCheck = `select * from users where id = '${req.params.userId}'`
    let sql = `update users set role = 'admin' where id = '${req.params.userId}'`
    if ( req.session.isLoggedIn && req.session.role === "main-admin" ) {
        db.query( userCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                if ( output[0].role != "admin" ) {
                    db.query( sql, ( err, results ) => {
                        if ( err ) throw err
                        res.status( 200 ).json( { results, msg: "Admin added" } )
                    } )
                } else {
                    res.json( { msg: "User is already an admin" } )
                }
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "User not found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: 'Unauthorized' } )
    }
}

//main-admin removes admin
exports.removeAdmin = async ( req, res ) => {
    let userCheck = `select * from users where id = '${req.params.userId}'`
    let sql = `update users set role = 'null' where id = '${req.params.userId}'`
    if ( req.session.isLoggedIn && req.session.role === "main-admin" ) {
        db.query( userCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                if ( output[0].role != "admin" ) {
                    res.json( { msg: "User already removed" } )
                } else {
                    db.query( sql, ( err, results ) => {
                        if ( err ) throw err
                        res.status( 200 ).json( { results, msg: "Admin removed" } )
                    } )
                }
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "User not found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: 'Unauthorized' } )
    }
}
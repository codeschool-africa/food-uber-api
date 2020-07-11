const { validationResult } = require( 'express-validator' );
const multer = require( "multer" )
const fs = require( "fs" )
const db = require( "../models/db" );
const { json } = require( 'body-parser' );

// add food by admin
exports.addFood = async ( req, res ) => {
    const { name, description, category, cost, featured } = req.body
    const errors = validationResult( req )
    let createdAt = new Date()
    let adminId = req.session.userId
    let sql = `INSERT INTO foods values (id,?,?,?,?,?,?,?)`

    // upload food image
    // create storage
    const storage = multer.diskStorage( {
        destination: ( req, file, cb ) => {
            cb( null, "./public/assets/uploads/food_images/" )
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
    } ).single( 'food_image' );

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

    if ( req.session.isLoggedIn && req.session.role === "admin" || req.session.role === "main-admin" ) {
        if ( !errors.isEmpty() ) {
            res.json( { errors: errors.array() } )
        } else {
            upload( req, res, err => {
                if ( err instanceof multer.MulterError ) {
                    res.json( { msg: `${err}` } )
                } else if ( err ) {
                    res.json( { msg: `${err}` } )
                } else {
                    console.log( req.file )
                    db.query( sql, [name, description, category, cost, featured, createdAt, adminId, req.file.name], ( err, results ) => {
                        if ( err ) throw err
                        if ( results ) {
                            res.json( { results, msg: "Details uploaded successful" } )
                        } else {
                            res.status( 500 ).json( { msg: "Internal server error" } )
                        }
                    } )
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
    let sql = `update foods set name = '${name}', description = '${description}', category = '${category}', cost = '${cost}', featured = '${featured}' where id = '${req.params.foodId}'`

    let errors = validationResult( req )

    if ( req.session.isLoggedIn && req.session.role === "admin" || req.session.role === "main-admin" ) {
        if ( !errors.isEmpty() ) {
            res.json( { errors: errors.array() } )
        } else {
            db.query( sql, ( err, results ) => {
                if ( err ) throw err
                if ( results ) {
                    res.json( { results, msg: "Food updated successful" } )
                } else {
                    res.status( 500 ).json( { msg: "Internal server error" } )
                }
            } )
        }
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

// upload food image
exports.updateFoodImage = async ( req, res ) => {
    // create storage
    const storage = multer.diskStorage( {
        destination: ( req, file, cb ) => {
            cb( null, "./public/assets/uploads/food_images/" )
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
    } ).single( 'food_image' );

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

    let foodCheck = `select * from foods where id = '${req.params.foodId}'`

    let uploadImage = () => {
        upload( req, res, err => {
            if ( err instanceof multer.MulterError ) {
                res.json( { msg: err } )
            } else if ( err ) {
                res.json( { msg: err } )
            } else {
                console.log( req.file )
                let sql = `update foods set food_image = '${req.file.name}' where id = '${req.params.foodId}'`
                db.query( sql, ( err, results ) => {
                    if ( err ) throw err
                    if ( results ) {
                        res.status( 200 ).json( { results, msg: "Image was updated successfully" } )
                    } else {
                        res.status( 500 ).json( { msg: "Internal server error" } )
                    }
                } )
            }
        } )
    }

    if ( req.session.isLoggedIn && req.session.role === "admin" || req.session.role === "main-admin" ) {
        db.query( foodCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                let deletedImage = output[0].food_image
                const path = `./public/assets/uploads/food_images/${deletedImage}`
                if ( deletedImage ) {
                    try {
                        fs.unlink( path )
                        uploadImage()
                    } catch ( error ) {
                        res.status( 500 ).json( { msg: `Error: ${error}` } )
                    }
                } else {
                    uploadImage()
                }
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "Food not found" } )
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
    if ( req.session.isLoggedIn && req.session.role === "admin" || req.session.role === "main-admin" ) {
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

exports.setFeaturedFood = async ( req, res ) => {
    let foodCheck = `select * from foods where id = '${req.params.foodId}'`
    let sql = `update foods set featured = '1' where id = '${req.params.foodId}'`
    if ( req.session.isLoggedIn && req.session.role === "admin" || req.session.role === "main-admin" ) {
        db.query( foodCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                if ( output[0].featured === 1 ) {
                    res.status( 400 ).json( { msg: "Food already registered to featured list" } )
                } else {
                    db.query( sql, ( err, results ) => {
                        if ( results ) {
                            res, json( { results, msg: "Food added in featured list" } )
                        } else {
                            res.status( 500 ).json( { msg: "Internal server error" } )
                        }
                    } )
                }
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "Food not found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

exports.removeFeaturedFood = async ( req, res ) => {
    let foodCheck = `select * from foods where id = '${req.params.foodId}'`
    let sql = `update foods set featured = '0' where id = '${req.params.foodId}'`
    if ( req.session.isLoggedIn && req.session.role === "admin" || req.session.role === "main-admin" ) {
        db.query( foodCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                if ( output[0].featured === 0 ) {
                    res.status( 400 ).json( { msg: "Food already removed from featured list" } )
                } else {
                    db.query( sql, ( err, results ) => {
                        if ( err ) throw err
                        if ( results ) {
                            res, json( { results, msg: "Food removed in featured list" } )
                        } else {
                            res.status( 500 ).json( { msg: "Internal server error" } )
                        }
                    } )
                }
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "Food not found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
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

// 
exports.search = async ( req, res ) => {
    let keyword = req.body.keyword
    let sql = `select * from foods where name like '%${keyword}%' or description like '%${keyword}%' or category like '%${keyword}%'`

    let errors = validationResult( req )

    if ( !errors.isEmpty() ) {
        res.json( { errors: errors.array() } )
    } else {
        db.query( sql, ( err, results ) => {
            if ( err ) throw err
            if ( results && results.length > 0 ) {
                res.json( { results } )
            } else if ( results && results.length === 0 ) {
                res.status( 404 ).json( { msg: "No result found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error, please try again" } )
            }
        } )
    }
}
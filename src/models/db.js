const mysql = require( "mysql" )

//config file contains all myql credentials
const dbConfig = require( "../config/db.config" )

const db = mysql.createConnection( {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    multipleStatements: true
} )

db.connect( ( err ) => {
    if ( err ) throw err
    console.log( "Database connected..." )
} )

module.exports = db

// const db = mysql.createConnection( {
//     host: process.env.DB_HOST || dbConfig.host,
//     user: process.env.DB_USER || dbConfig.user,
//     password: process.env.DB_PASS || dbConfig.password,
//     database: process.env.DB_DATABASE || dbConfig.database,
//     multipleStatements: true
// } )
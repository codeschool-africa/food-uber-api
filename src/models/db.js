const mysql = require( "mysql" )

//config file contains all myql credentials
const dbConfig = require( "../config/db.config" )

const db = mysql.createConnection( {
    server: process.env.DB_SERVER || dbConfig.server,
    user: process.env.DB_USER || dbConfig.user,
    password: process.env.DB_PASS || dbConfig.password,
    database: process.env.DB_DATABASE || dbConfig.database,
    multipleStatements: true
} )

db.connect( ( err ) => {
    if ( err ) throw err
    console.log( "Database connected..." )
} )

module.exports = db
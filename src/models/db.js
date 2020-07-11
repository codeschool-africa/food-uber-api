const mysql = require( "mysql" )

//config file contains all myql credentials
const dbConfig = require( "../config/db.config" )

const db = mysql.createConnection( {
    host: dbConfig.host,
    // port: dbConfig.port,
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
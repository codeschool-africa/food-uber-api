const express = require( "express" )
const path = require( "path" )
const bodyParser = require( "body-parser" );
const cors = require( "cors" )
const cookieSession = require( 'cookie-session' );
const db = require( "./src/models/db" )
const router = require( "./src/routes/routes" )

const app = express()

//setting  cookie session
app.use( cookieSession( {
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 192000 * 1000
} ) );

// parse requests of content-type: application/json
app.use( bodyParser.json() );

//cors handling
app.use( cors() )

//initializing the router
app.use( "/api", router )

// parse requests of content-type: application/x-www-form-urlencoded
app.use( bodyParser.urlencoded( { extended: false } ) );

// landing page of the api
app.get( "/", ( req, res ) => {
  res.sendFile( path.join( __dirname, "views", "index.html" ) )
} );

// create a database, when running this route, make sure you comment the database name in mysql.createConnection method
app.get( "/createdb", ( req, res ) => {
  let sql = "Create database foodUber"

  db.query( sql, ( err, result ) => {
    if ( err ) throw err
    res.json( result )
  } )
} )

// create users table
app.get( "/createUsersTable", ( req, res ) => {
  let sql = "Create table users(id varchar(36) Primary key, name varchar(255), email varchar(255), tel varchar(255), password varchar(255), role varchar(255), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, confirmed tinyint(1) default false )"

  db.query( sql, ( err, result ) => {
    if ( err ) throw err
    res.json( result )
  } )
} )

app.get( "/createFoodsTable", ( req, res ) => {
  let sql = "Create table foods(id varchar(36) Primary key not null, name varchar(255) not null, description varchar(255), category varchar(255), cost int(11) not null, featured tinyint(1) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, createdBy varchar(255) )"

  db.query( sql, ( err, result ) => {
    if ( err ) throw err
    res.json( result )
  } )
} )

// app.get("/createOrdersTable", (req, res) => {
//   let sql = "Create table orders(id varchar(36) Primary key not null, name varchar(255) not null, category varchar(255), cost int(11) not null, featured tinyint(1) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, createdBy varchar(255) )"

//   db.query( sql, ( err, result ) => {
//     if ( err ) throw err
//     res.json( result )
//   } )
// })

const PORT = process.env.PORT || 5000

app.listen( PORT, () => console.log( `Server running on port ${PORT}` ) )

//todo
// add verification via emails to verify users (right??)
// create food table with required columns
// create orders table with relevant columns
//create profile-images table
//create food images table

//also try to deploy the api and run it if it works
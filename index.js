const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")
const cookieSession = require("cookie-session")
const swaggerUi = require("swagger-ui-express")
const dotenv = require("dotenv")
const db = require("./src/models/db")
const router = require("./src/routes/routes")
const swaggerDocument = require("./swagger/swagger.json")

const app = express()

app.use(express.static(path.join(__dirname, "public")))

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

//setting  cookie session
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 1920000 * 1000,
  })
)

// parse requests of content-type: application/json
app.use(bodyParser.json())

//cors handling
app.use(cors())

// dot env
dotenv.config()

//initializing the router
app.use("/api", router)

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))

app.use(express.static(path.join(__dirname, "/public")))

// landing page of the api
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"))
})

// create a database, when running this route, make sure you comment the database name in mysql.createConnection method
app.get("/createdb", (req, res) => {
  let sql = "Create database foodUber"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

// create various tables
app.get("/createUsersTable", (req, res) => {
  let sql =
    "Create table users(id varchar(36) Primary key, name varchar(255), email varchar(255), tel varchar(255), password varchar(255), role varchar(255), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, confirmed tinyint(1) default false, location varchar(255), address varchar(255), dp_path varchar(255) )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/upDateUserTable", (req, res) => {
  // let sql =
  //   "Create table foods(id int auto_increment Primary key not null, name varchar(255) not null, description varchar(255), category varchar(255), cost int(11) not null, featured tinyint(1) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, createdBy varchar(255), food_image varchar(255) )"

  let sql = "ALTER TABLE `users` CHANGE COLUMN `dp_path` `dp_path` MEDIUMTEXT;"
  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/upDateFoodsTable", (req, res) => {
  // let sql =
  //   "Create table foods(id int auto_increment Primary key not null, name varchar(255) not null, description varchar(255), category varchar(255), cost int(11) not null, featured tinyint(1) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, createdBy varchar(255), food_image varchar(255) )"

  let sql =
    "ALTER TABLE `foods` CHANGE COLUMN `food_image` `food_image` MEDIUMTEXT;"
  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/createFoodsTable", (req, res) => {
  let sql =
    "Create table foods(id int auto_increment Primary key not null, name varchar(255) not null, description varchar(255), category varchar(255), cost int(11) not null, featured tinyint(1) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, createdBy varchar(255), food_image varchar(255) )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/createOrdersTable", (req, res) => {
  let sql =
    "Create table orders(id int auto_increment Primary key not null, foodId int not null, location varchar(255) not null, delivery_time timestamp not null, number_of_plates int(11) not null, special_description varchar(255), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, orderedBy varchar(255), tel varchar(255) not null, address varchar(255), userId varchar(255), delivered tinyint(1) not null, pending tinyint(1) not null, food_name varchar(255) not null )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/createCartTable", (req, res) => {
  let sql =
    "Create table carts(id int auto_increment Primary key not null, foodId int not null, food_name varchar(255) not null, userId varchar(255), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, cart_image varchar(255) )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/createNotificationsTable", (req, res) => {
  let sql =
    "Create table notifications(id int auto_increment Primary key not null, orderId int not null, orderedBy varchar(255) not null, userId varchar(255), status varchar(255) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, read_status tinyint(1) default 0 not null, food_name varchar(255) not null, number_of_plates int not null, delivery_time timestamp not null )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log(`Server running on port ${PORT}`)
  }
})

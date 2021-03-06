const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")
const swaggerUi = require("swagger-ui-express")
const dotenv = require("dotenv")
const db = require("./src/models/db")
const router = require("./src/routes/routes")
const swaggerDocument = require("./swagger/swagger.json")

const app = express()

app.use(express.static(path.join(__dirname, "public")))

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// parse requests of content-type: application/json
app.use(bodyParser.json({ limit: "100mb" }))
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }))

//cors handling
app.use(cors())

// dot env
dotenv.config()

//initializing the router
app.use("/api", router)

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
    "Create table users(id varchar(36) Primary key, name varchar(255), email varchar(255), tel varchar(255), password varchar(255), role varchar(255), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, confirmed tinyint(1) default false, location varchar(255), address varchar(255), dp_path LONGTEXT )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/updateUsersTable", (req, res) => {
  let sql = "Alter table users add column favourites longText"
  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/createFoodsTable", (req, res) => {
  let sql =
    "Create table foods(id int auto_increment Primary key not null, name varchar(255) not null, description varchar(255), category varchar(255), cost int(11) not null, featured tinyint(1) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, createdBy varchar(255), food_image LONGTEXT, plates int(11) )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

app.get("/createOrdersTable", (req, res) => {
  let sql =
    "Create table orders(id int auto_increment Primary key not null, foods LONGTEXT not null, location varchar(255) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, orderedBy varchar(255), delivered tinyint(1) not null, pending tinyint(1) not null, derivery_cost int(11) not null )"

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
    "Create table notifications(id int auto_increment Primary key not null, orderId int not null, status varchar(255) not null, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, read_status tinyint(1) default 0 not null)"

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

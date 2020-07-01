const express = require("express")

const path = require("path")

const bodyParser = require("body-parser");

const cors = require("cors")

const db = require("./src/models/db")

const app = express()

const router = require("./src/routes/routes")

// parse requests of content-type: application/json
app.use(bodyParser.json());

//cors handling
app.use(cors())

//initializing the router
app.use("/api", router)

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// landing page of the api
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"))
});

// create a database, when running this route, make sure you comment the database name in mysql.createConnection method
app.get("/createdb", (req, res) => {
  let sql = "Create database foodUber"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

// create seller table
app.get("/createCustomerTable", (req, res) => {
  let sql = "Create table customers(id varchar(36) Primary key, name varchar(255), email varchar(255), tel varchar(255), password varchar(255) )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

// create seller table
app.get("/createAdminsTable", (req, res) => {
  let sql = "Create table admin(id varchar(36) Primary key, name varchar(255), email varchar(255), tel varchar(255), password varchar(255) )"

  db.query(sql, (err, result) => {
    if (err) throw err
    res.json(result)
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
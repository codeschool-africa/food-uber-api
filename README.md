# Welcome to the food-uber-api wiki!

##  built with nodejs, express and mysql database

### install mysql database or use xammp and phpMyAdmin to run mysql database

### run npm install to install all dependencies

### create config folder and db.config.js file with mysql credentials

    const dbConfig = {
        host : "localhost", // host
        user: "root", // root
        password: "", // your database password
        database: "food-uber-app" //database name
    }

    module.exports = dbConfig

To start the application run  
    
    npm run dev or npm start

Now you application will be live on http://localhost:5000  

Go to http://localhost:5000/createdb to create database, you can change database name from the code, and before running this, mae sure you comment the database name in your db.config.js file, run this once because the database is only created once.

To create customer table go to http://localhost:5000/createCustomerTable, this also should run only once. running more than once will throw an error that table or database already exists
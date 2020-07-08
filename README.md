# Welcome to the food-uber-api!

built with nodejs, express and mysql database

install mysql database or use xammp and phpMyAdmin to run mysql database

run npm install to install all dependencies

create config folder and db.config.js file with mysql credentials

    const dbConfig = {
        host : "localhost", // host
        user: "root", // root
        password: "", // your database password
        database: "food-uber-app" //database name
    }

    module.exports = dbConfig

also for the emails to work, create email.config.js in the config folder with your email credentials

    module.exports = {
        username: "youremail@email.com", // your email
        password: "password" // your password
    }

To start the application run  
    
    npm run dev or npm start

Now you application will be live on http://localhost:5000  

Go to http://localhost:5000/createdb to create database, you can change database name from the code, and before running this, make sure you comment the database name in your db.config.js file, run this once because the database is only created once. All routes to create table should also run once

To create users table go to http://localhost:5000/createUsersTable

To create foods table go to http://localhost:5000/createFoodsTable

To create orders table go to http://localhost:5000/createOrdersTable

To create carts table go to http://localhost:5000/createCartsTable

To create notifications table go to http://localhost:5000/createNotificationsTable

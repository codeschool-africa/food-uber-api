const nodemailer = require( "nodemailer" )

const config = require( "../config/email.config" )

const transporter = nodemailer.createTransport( {
    service: "Gmail",
    auth: {
        user: config.username,
        pass: config.password
    }
} );

module.exports = transporter
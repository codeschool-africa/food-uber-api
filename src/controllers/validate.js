const { body } = require( 'express-validator/check' );

exports.validate = ( method ) => {
    switch ( method ) {
        case 'register': {
            return [
                body( 'name', "This field shouldn't be empty" ).exists(),
                body( 'email', 'Invalid email' ).exists().isEmail(),
                body( 'tel', "This field must include only numbers" ).isInt(),
                body( 'password', "This field must include only numbers" ).isInt(),
            ]
        }
    }
}
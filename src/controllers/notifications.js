const db = require( "../models/db" )

// get all notifications
exports.notifications = async ( req, res ) => {
    let sql = `select * from notifications`
    if ( req.session.isLoggedIn && req.session.role === "admin" || req.session.role === "main-admin" ) {
        db.query( sql, ( err, results ) => {
            if ( err ) throw err
            if ( results && results.length > 0 ) {
                res.status( 200 ).json( { msg: "Notifications retrieved", results } )
            } else if ( results && results.length === 0 ) {
                res.status( 404 ).json( { msg: "No notification found" } )
            } else {
                res.status( 500 ).json( { msg: "Internal server error" } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: "Unauthorized" } )
    }
}

// create notifications
// exports.createNotification = async ( req, res ) => {
//     let createdAt = new Date()
//     let orders = `select * from orders`
//     let pendingOrders = `select * from orders where delivery_time < NOW()`

//     // let notifications = []

//     // search on how to add multiple rows in a table, mysql
//     db.query( orders, ( err, output ) => {
//         if ( err ) throw err
//         if ( output && output.length > 0 ) {
//             db.query( pendingOrders, ( err, outputs ) => {
//                 // console.log( outputs )
//                 outputs.map( output => {
//                     let sql = `insert into notifications values (id,'${output.id}','${output.orderedBy}','${output.userId}',"Pending Order",'${createdAt}',0,'${output.food_name}','${output.number_of_plates}','${output.delivery_time}')`
//                     // [outputs.map( output => ["id", output.id, output.orderedBy, output.userId, "Pending Order", createdAt, 0, output.food_name, output.number_of_plates, output.delivery_time] )],
//                     db.query(
//                         sql,
//                         ( err, results ) => {
//                             if ( err ) throw err
//                             res.json( { results } )
//                         }
//                     );
//                 } )
//             } )
//         } else if ( output && output.length === 0 ) {
//             res.status( 404 ).json( { msg: "No order found" } )
//         } else {
//             res.status( 500 ).json( { msg: "Internal server error" } )
//         }
//     } )
// }

// read notification
exports.readNotification = async ( req, res ) => {
    let sql = `update notifications set read_status = '1' where id = '${req.params.notificationId}'`
    let notificationCheck = `select * from notifications where id = '${req.params.notificationId}'`

    if ( req.session.isLoggedIn && req.session.role === "main-admin" || req.session.role === "admin" ) {
        db.query( notificationCheck, ( err, output ) => {
            if ( err ) throw err
            if ( output && output.length > 0 ) {
                db.query( sql, ( err, results ) => {
                    if ( err ) throw err
                    if ( results ) {
                        res.status( 200 ).json( { msg: "Notification read", results } )
                    } else {
                        res.status( 500 ).json( { msg: "Internal server error" } )
                    }
                } )
            } else if ( output && output.length === 0 ) {
                res.status( 404 ).json( { msg: "Notification wasn't found " } )
            } else {
                res.status( 500 ).json( { msg: 'Internal server error' } )
            }
        } )
    } else {
        res.status( 403 ).json( { msg: 'Unauthorized' } )
    }
}
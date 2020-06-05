// this is not needed anymore, it is already exported in the app.js

module.exports = (req, res, next ) => {
    res.locals.user = req.user; 
    next()
}



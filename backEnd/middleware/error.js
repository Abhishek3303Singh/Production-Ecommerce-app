module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Server is Not responding!"

    // wrong id Search 
    // error Type is CastError
    if(err.name === 'CastError'){
        const message = ` Invalid search: ${err.path}`
        err = new HandleError(message, 400)
    }
    res.status( err.statusCode).json({
        success : false,
        message :err.message,
    })
}
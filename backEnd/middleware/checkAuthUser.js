const jwt = require('jsonwebtoken');
const UserModel = require('../dataBase/User')
// const secretKey = "ABHISHEKSINGHSINGLEANDILOVE"
const secretKey = process.env.SECRET_KEY

exports.isAuthenticated= async(req, res, next)=>{
    // console.log(secretKey, 'secret-key')
    // console.log('running')
    const {token} = req.cookies;
    // console.log(token)
    if(!token){
        return res.status(401).json({
            status:"failed",
            message:'Please login to access this page.. '
        })
    }
    const verifyData = jwt.verify(token, secretKey)
    // console.log(verifyData)
    req.user = await UserModel.findById(verifyData.data)
    // console.log('req.user',req.user)     
    next()

}

exports.checkAdminAuthorize=(...roles)=>{
    // console.log('role=>',...roles)
    return (req, res, next)=>{
        // console.log('res=>',req.user.role)
        if(!roles.includes(req.user.role)){
            return next( res.status(401).json({
                status:'failed',
                message:`Role: ${req.user.role} is not allowed to access this page`

            }))
        }
        next()
    }
}
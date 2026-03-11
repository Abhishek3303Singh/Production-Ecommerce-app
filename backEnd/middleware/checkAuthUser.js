const jwt = require('jsonwebtoken');
const UserModel = require('../dataBase/User')
// const secretKey = "ABHISHEKSINGHSINGLEANDILOVE"
const secretKey = process.env.SECRET_KEY

exports.isAuthenticated= async(req, res, next)=>{

    try{

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
    const user = await UserModel.findById(verifyData.id)
    // console.log('req.user',req.user)     

    if (!user) {
        return res.status(401).json({
            status: "failed",
            message: 'User not found. Please login again.'
        });
    }
    req.user = user;

    next()

    }catch (error) {
        // console.error('Auth middleware error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: "failed",
                message: 'Invalid token. Please login again.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: "failed",
                message: 'Token expired. Please login again.'
            });
        }
        
        return res.status(500).json({
            status: "failed",
            message: 'Authentication error'
        });
    }
    // console.log(secretKey, 'secret-key')
    // console.log('running')
    

}


// exports.isAuthenticated = async (req, res, next) => {
//     try {
//         const { token } = req.cookies;
        
//         // console.log('Auth middleware - token exists:', !!token);
        
//         if (!token) {
//             return res.status(401).json({
//                 status: "failed",
//                 message: 'Please login to access this page.'
//             });
//         }
        
//         // Verify the token
//         const decoded = jwt.verify(token, secretKey);
//         // console.log('Auth middleware - decoded token:', decoded);
        
        
//         const user = await UserModel.findById(decoded.id);
        
//         if (!user) {
//             return res.status(401).json({
//                 status: "failed",
//                 message: 'User not found. Please login again.'
//             });
//         }
        
//         req.user = user;
//         // console.log('Auth middleware - user authenticated:', user.email);
        
//         next();
        
//     } catch (error) {
//         // console.error('Auth middleware error:', error.message);
        
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({
//                 status: "failed",
//                 message: 'Invalid token. Please login again.'
//             });
//         }
        
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({
//                 status: "failed",
//                 message: 'Token expired. Please login again.'
//             });
//         }
        
//         return res.status(500).json({
//             status: "failed",
//             message: 'Authentication error'
//         });
//     }
// };

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
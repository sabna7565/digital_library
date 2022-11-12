const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const Admin = require('../models/adminModel')

// const protect = asyncHandler(async (req, res, next) => {
//     let token;

//     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
//         try {
//           // Get token from header
//           token = req.headers.authorization.split(' ')[1]
        
//           // verify token
//           const decoded = jwt.verify(token, process.env.JWT_SECRET)
       
//           // Get user from the token
//           req.user = await User.findById(decoded.id).select('-password')
//           next()

        
//         } catch (error) {
//             console.log(error)
//             res.status(401)
//             throw new Error('Not authorized')
//         }
//     }
    
//     if(!token) {
//         res.status(401)
//         throw new Error('Not authorized, no token')
//     }
// })

// //staff protect routes

// const sProtect = asyncHandler(async (req, res, next) => {
//     let token;

//     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
//         try {
//           // Get token from header
//           token = req.headers.authorization.split(' ')[1]
        
//           // verify token
//           const decoded = jwt.verify(token, process.env.JWT_SECRET)
       
//           // Get user from the token
//           req.staff = await Staff.findById(decoded.id).select('-password')
//           next()

        
//         } catch (error) {
//             console.log(error)
//             res.status(401)
//             throw new Error('Not authorized')
//         }
//     }

//     if(!token) {
//         res.status(401)
//         throw new Error('Not authorized, no token')
//     }
// })

//admin protect routes
const isAdmin = asyncHandler(async (req,res, next) => {
    let token;

    if (
        req.headers.authorization && req.headers.authorization.startsWith("Bearer")
    ){
        try {
            token = req.headers.authorization.split(" ")[1];

               // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get admin from the token
            req.admin = await Admin.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.log(error);
              res.status(401);
              throw new Error("Admin Not authorized");
          }
    }
    if (!token) {
        res.status(401);
        throw new Error("Admin Not authorized, no token");
      }
})

module.exports = {  isAdmin }
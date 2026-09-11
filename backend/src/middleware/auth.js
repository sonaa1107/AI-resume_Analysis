const env=require('../config/env');
const {verifyToken}=require('../utils/jwt');
const ApiError=require('../utils/ApiError');
const User=require('../models/user.model');

async function requireAuth(req,res,next){
    try{
        const token=req.cookies?.[env.cookieName]
        if(!token){throw ApiError.unauthorized()}

        const payload=verifyToken(token);
        const user=await User.findById(payload.sub)
        if(!user)throw ApiError.unauthorized();
        req.user=user;
        next();
    }
    catch(err){
        if(err.name==='TokenExpiredError'|| err.name==='JsonWebTokenError'){
            return next(ApiError.unauthorized('Invalid or expired token'));
        }
        next(err);{
    }
}
}
module.exports={requireAuth};

const express =require('express');
const {z}=require('zod');

const env=require('../config/env');
const asyncHandler=require('../utils/asyncHandler');
const ApiError=require('../utils/ApiError');
const {validate}=require('../middleware/validate');
const {authLimiter}=require('../middleware/rateLimiter');
const {signToken,cookieOptions}=require('../utils/jwt');
const {requireAuth}=require('../middleware/auth');
const User=require('../models/user.model');

const router=express.Router();


const registerSchema=z.object({
    name:z.string().trim().min(1),
    email:z.string().email(),
    password:z.string().min(8).max(25),
});

const loginSchema=z.object({
    email:z.string().email(),
    password:z.string().min(8).max(25),
});

const profileSchema=z.object({
    name:z.string().trim().min(1)
})
const passwordSchema=z.object({
    oldPassword:z.string().min(8).max(25),
    newPassword:z.string().min(8).max(25),
});

function issueSession(res,user){
    const token=signToken({sub:user._id.toString()})
    res.cookie(env.cookieName,token,cookieOptions);
}
// Register a new user
router.post(
    '/register',
    authLimiter,
    validate(registerSchema),
    asyncHandler(async(req,res)=>{
        const{name,email,password}=req.body;

        const existUser=await User.findOne({email});
        if(existUser){
            throw ApiError.conflict('User with this email already exists');
        }
        const user=await User.create({
            name,email,password
        });
        issueSession(res,user);
        res.status(201).json({user});
    })
)

// Login user
router.post('/login',
    authLimiter,
    validate(loginSchema),
    asyncHandler(async (req,res)=>{
        const {email,password}=req.body;
        const user=await User.findOne({email}).select('+password');
        if(!user){
            throw ApiError.unauthorized('Invalid email or password');
        }
        const isMatch=await user.comparePassword(password);
        if(!isMatch){
            throw ApiError.unauthorized('Invalid email or password');
        }
        issueSession(res,user);
        res.json({user});

    })
)   
// Logout user
router.post(
    '/logout',(req,res)=>{
        res.clearCookie(env.cookieName,{...cookieOptions,expires:new Date(0)});
        res.json({message:'Logged out successfully'});
    }
)
// Get current user
router.get('/me',
    requireAuth,
    asyncHandler(async(req,res)=>{
        const user=req.user;
        res.json({user});
    })
)
//update user profile
router.patch(
    '/profile',
    requireAuth,
    validate(profileSchema),
    asyncHandler(async(req,res)=>{
        req.user.name=req.body.name;
        await req.user.save();
        res.json({user:req.user});
    })
)

//change user password
router.patch(
    '/password',
    authLimiter,
    requireAuth,
    validate(passwordSchema),
    asyncHandler(async(req,res)=>{
        const user=await User.findById(req.user._id).select('+password');
        if(!user){
            throw ApiError.notFound('User not found');
        }
        const isMMatch=await user.comparePassword(req.body.oldPassword);
        if(!isMatch){
            throw ApiError.badRequest('Current password is incorrect');
        }
        user.password=req.body.newPassword;
        await user.save();
        res.json({message:'Password updated successfully'});
    })
)

module.exports=router;   
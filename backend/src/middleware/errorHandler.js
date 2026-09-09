const env=require('../config/env');
const ApiError=require('../utils/ApiError');

function notFound(req,res,next){
next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}
const errorHandler=(err,req,res,next)=>{
    const statusCode=err.statusCode||500;
    const message=err.message||'Internal Server Error';
    const details=err.details||null;

    if(err.name==='validationError' && err.errors){
        statusCode=400;
        details=object.fromEntries(
            Object.entries(err.errors).map(([key,value])=>[key,value.message])
        );
        message="Validation Failed";
    }
    else if(err.name==='CastError'){
        statusCode=400;
        message=`Invalid ${err.path}: ${err.value}`;
    }
    else if(err.code===11000){
        statusCode=409;
        message="Duplicate Key";
        details=err.keyValue;
    }
    else if(err.name==='ZodError'){
        statusCode=400;
        message="Validation Failed";
        details=err.issues;
    }

    if(statusCode>=500){
        console.error(`[${req.method} ${req.originalUrl}]`,err);
    }
    res.status(statusCode).json({
        error:{
            message,
            ...(details?{details}:{}),
            ...(env.isProd?{}:{stack:err.stack}),
        },
    });
};

module.exports={errorHandler, notFound};

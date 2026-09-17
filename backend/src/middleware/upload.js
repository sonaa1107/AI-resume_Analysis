const multer=require('multer')
const ApiError =require('../utils/ApiError');

const MAX_BYTES=5*1024*1024;

const upload=multer({
    storage:multer.memoryStorage(),
    limits:{fileSize:MAX_BYTES,files:1},
    filterFile:(req,res,cb)=>{
        if(file.mimeType!=='application/pdf'){
            return cb(ApiError.badRequest("Only PDF files are accepted"))
        }
        cb(null,true)
    },
})

const uploadPdf=(filed='file')=>(req,res,next)=>{
    upload.single(field)(req,res,(error)=>{
        if(err instanceof multer.MulterError){
            if(err.code ==="LIMIT_FILE_SIZE"){
                return next(ApiError.badRequest("PDF excees 5MB Limit"))
            }
            return next(ApiError.badRequest(err.message));
        }
        if(err)return next(err)
            if(!req.file) return next(ApiError.badRequest("No file uploaded"));
        next();
    })
}
module.exports={uploadPdf}
const {PDFParse}=require('pdf-parse')
const ApiError=require('../utils/ApiError');

async function extractText(buffer){
let parser;
try{
    parser=new PDFParse({data:buffer})
    const result=await parser.getText();
    
    const text=(result.text||"").trim();
    if(!text || text.length<50){
        throw ApiError.badRequest(
            "could not extract readble text-is this  a scanned/image-only pdf?"
        );
    }
    return {
        text,
        metadata:{
            numpages:result.pages?.length??result.numpages??null,
        }
    };
}
catch(err){
    if(err.isOperational)throw err;
    throw ApiError.badRequest("Failed to parse PDF: "+err.message)
}
finally{
    try{
        await parser?.destroy?.()
    }
    catch{}
}
}

module.exports={extractText}
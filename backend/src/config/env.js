const dotenv=require('dotenv');
const path=require('path');

dotenv.config({path:path.resolve(__dirname,'../../.env')});

const required=["MONGO_URI","JWT_SECRET"];
const missing=required.filter((key)=>!process.env[key]);
if(missing.length){
    console.log(process.env.MONGO_URI)
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

module.exports={
    node_env:process.env.NODE_ENV||'development',
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    PORT:Number(process.env.PORT)||3000,
    cookieName:process.env.COOKIE_NAME||'token',
    jwtExpiration:process.env.JWT_EXPIRATION||'7d',
    clientOrigin:(process.env.CLIENT_ORIGIN||'http://localhost:5173').
    split(',').
    map((origin)=>origin.trim()).filter(Boolean),
    geminiApiKey:process.env.GEMINI_API_KEY,
    geminiModel:process.env.GEMINI_MODEL||'gemini-3.5-flash-lite',
    isProd:process.env.NODE_ENV==='production'
};
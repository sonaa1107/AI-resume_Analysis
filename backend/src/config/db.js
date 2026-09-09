const mongoose=require('mongoose');
const env=require('./env');

mongoose.set('strictQuery',true);

async function connectDB(){
    try{
        await mongoose.connect(env.MONGO_URI);
        console.log('MongoDB connected');
    }catch(err){
        console.error('MongoDB connection error:',err.message);
        process.exit(1);
    }   
}
module.exports=connectDB;
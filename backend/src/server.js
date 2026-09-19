const express=require('express');
const cors=require('cors');
const morgan=require('morgan');
const cookieParser=require('cookie-parser');

const env=require('./config/env');
const connectDB=require('./config/db');
const {errorHandler,notFound}=require('./middleware/errorHandler');

const healthRouter=require('./routes/health');
const authRouter=require('./routes/auth')
const resumeRouter=require('./routes/resume')

const app=express();

app.set('trust proxy',1);

app.use(cors({
    origin:env.clientOrigin,
    credentials:true
}));

app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true,limit:'1mb'}));
app.use(cookieParser());

if(!env.isProd)app.use(morgan('dev'));

app.use('/health', healthRouter);
app.use('/api/auth',authRouter);
app.use('/api/resume',resumeRouter)

app.use(notFound);
app.use(errorHandler);


async function start(){
    try{
        await connectDB();
        app.listen(env.PORT,()=>{
            console.log(`Server running in ${env.node_env} mode on port ${env.PORT}`);
        }); 
    }
    catch(err){ 
        console.error('Failed to start server:',err.message);
        process.exit(1);
    }
}

process.on('unhandledRejection',(reason)=>{
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
})

start();
module.exports=app;
const express=require('express');
const mogoose=require('mongoose');

const router=express.Router();

router.get("/",(req,res)=>{
    const stated=['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status:"ok",
        dbState:stated[mogoose.connection.readyState],
        uptime:process.uptime(),
        timestamp:new Date().toISOString()
    })
});

module.exports=router;
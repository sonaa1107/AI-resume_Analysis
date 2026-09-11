const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema=new momgoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,  
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/],
        index:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,    
    }
},{timestamps:true});

userSchema.pre('save',async function(){
    if(!this.isModified("password"))return;
    const hash=await bcrypt.hash(this.password,10);
    this.password=hash;
    return;
})
userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}
userSchema.methods.toJSON=function(){
    const obj=this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
}
module.exports=mongoose.model('User',userSchema);
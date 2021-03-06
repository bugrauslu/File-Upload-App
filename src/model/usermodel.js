const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const UserSchema=new Schema({
    firstname:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:30
    },
    lastname:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:30
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    emailactive:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:true,
        trim:true
    }
},{collection:'users',timestamps:true});


const User=mongoose.model('User',UserSchema);

module.exports=User;
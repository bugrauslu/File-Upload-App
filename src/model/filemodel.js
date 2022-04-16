const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const fileSchema=new Schema({
    file:{
        type:String
    },
    uploaderid:{
        type:String,
    },
    sharelink:{
        type:String
    }
},{collection:'files',timestamps:true});


const files=mongoose.model('files',fileSchema);

module.exports=files;
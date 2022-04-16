const mongoose=require('mongoose');


mongoose.connect(process.env.DATABASE_CONNECTION_STRING)
.then(()=>{
    console.log("database connection successfully");
})
.catch(err=>{
    console.log(`database connection error ${err}`);
})
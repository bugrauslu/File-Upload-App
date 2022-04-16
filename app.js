const express=require('express');
const dotenv=require('dotenv').config();
const app=express();
const session=require('express-session');
const path=require('path');
const flash=require('connect-flash');
const passport=require('passport');




//dbconnection
require('./src/config/database');

const MongoDBStore = require('connect-mongodb-session')(session);

const sessionstore = new MongoDBStore({
  uri: process.env.DATABASE_CONNECTION_STRING,
  collection: 'sessions'
});



//template engine
const ejs=require('ejs');
const expresslayouts=require('express-ejs-layouts');
app.use(expresslayouts);
app.use(express.static('public'));
app.set('view engine','ejs');
app.set('views',path.resolve(__dirname,'./src/views'));

//session 
app.use(session(
    {
        secret: process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:true,
        cookie:{
            maxAge:1000*60*60*24
        },
        store:sessionstore
    }
    
))

//flash message
app.use(flash());
app.use((req,res,next)=>{
    res.locals.validation_error=req.flash('validation_error');
    res.locals.success_message=req.flash('success_message');
    res.locals.email=req.flash('email');
    res.locals.firstname=req.flash('firstname');
    res.locals.lastname=req.flash('lastname');
    res.locals.password=req.flash('password');
    res.locals.repassword=req.flash('repassword');

    res.locals.login_error=req.flash('error');

    next();
})

//passportjs//
app.use(passport.initialize());
app.use(passport.session());


//formsinputmiddleware
app.use(express.urlencoded({extended:true}));

//router includes//
const authRouter=require('./src/routers/auth_router');
const adminrouter=require('./src/routers/admin_router');




let sayac=0;


app.get('/',(req,res)=>{
    // if (req.session.sayac) {
    //         req.session.sayac++;
    // } else {
    //     req.session.sayac=1;
    // }
    
    // res.json({
    //     selam:"hello world",
    //     sayacim:req.session.sayac,
    //     user:req.user
    // })
    res.render('login',{layout:'./layouts/auth_layout.ejs'})
})



app.use('/',authRouter);
app.use('/admin',adminrouter);





app.listen(process.env.PORT,()=>{
    console.log(`server ${process.env.PORT} started`);
})
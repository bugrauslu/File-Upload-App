const{validationResult, body}=require('express-validator');
const  passport  = require('passport');
const User=require('../model/usermodel');
require('../config/passport_local')(passport);
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const jwt=require('jsonwebtoken');
const { getMaxListeners } = require('../model/usermodel');
const { text } = require('express');


const showtoLoginPage=(req,res,next)=>{
    res.render('login',{layout:'./layouts/auth_layout.ejs'})
}

const postthetoLoginPage=(req,res,next)=>{

    const ErrArray=validationResult(req);
        req.flash('email',req.body.email)
        req.flash('password',req.body.password)
    if (!ErrArray.isEmpty()) {
        req.flash('validation_error',ErrArray.array());
        
   
        res.redirect('/login');

    }else{
        passport.authenticate('local',{
            successRedirect:'/admin',
            failureRedirect:'/login',
            failureFlash:true                                        
             })(req,res,next);

    }


       
     


}


const showtoRegisterPage=(req,res,next)=>{
    
    res.render('register',{layout:'./layouts/auth_layout.ejs'})
}

const posttheRegisterPage=async(req,res,next)=>{
    const ErrArray=validationResult(req);
        if (!ErrArray.isEmpty()) {
            req.flash('validation_error',ErrArray.array());
            req.flash('email',req.body.email)
            req.flash('password',req.body.password)
            req.flash('firstname',req.body.firstname)
            req.flash('lastname',req.body.lastname)
            req.flash('repassword',req.body.repassword)
            res.redirect('/register');
    
        }else{
            try {
                const _user=await User.findOne({email:req.body.email})


                if (_user &&_user.emailactive==true) {
                    req.flash('validation_error',[{msg:"This email has been used before."}])
                    req.flash('email',req.body.email)
                    req.flash('password',req.body.password)
                    req.flash('firstname',req.body.firstname)
                    req.flash('lastname',req.body.lastname)
                    req.flash('repassword',req.body.repassword)
                    res.redirect('/register')
                }else if((_user && _user.emailactive==false) || _user==null ){

                    if (_user) {
                        await User.findByIdAndRemove({_id:_user._id})
                    }
                        const newUser=new User({
                            email:req.body.email,
                            password: await bcrypt.hash(req.body.password,10),
                            firstname:req.body.firstname,
                            lastname:req.body.lastname
                        });
                       await newUser.save();
                       console.log("user saveed");
                       


                        //jwt
                        const jwtinformaiton={
                            id:newUser.id,
                            mail:newUser.email
                        }

                        const jwttoken= jwt.sign(jwtinformaiton,process.env.CONFIRM_MAIL_JWT_SECRET,{expiresIn:'1d'});

                        console.log(jwttoken);

                        //mailproccess

                        const url=process.env.WEB_SITE_URL+'verify?id='+jwttoken;
                        console.log("gidilicek url"+url);

                        let transporter=nodemailer.createTransport({
                            service:'gmail',
                            auth:{
                                user:process.env.GMAIL_USER,
                                pass:process.env.GMAIL_PASSWORD
                            }

                        })

                        await transporter.sendMail({
                            from:'nodejs app',
                            to:newUser.email,
                            subject:'Please Confirm Email',
                            text:"Click on the link to confirm your email : "+ url
                        },(error,info)=>{
                            if (error) {
                                console.log("mail send error"+error);
                            }
                            console.log("mail sended");
                            //console.log(info);
                            transporter.close();
                        })
                        req.flash('success_message',[{msg:'Please check your mailbox'}])

                        res.redirect('/login');
                }
            } catch (error) {
                console.log("error  :" +error);
            }
        }
   
    
}



const showtoForgetPassPage=(req,res,next)=>{
    res.render('forget_password',{layout:'./layouts/auth_layout.ejs'})
}

//password reset  procces
const posttheForgetPassPage=async(req,res,next)=>{
    
    const ErrArray=validationResult(req);
    if (!ErrArray.isEmpty()) {
        req.flash('validation_error',ErrArray.array());
        req.flash('email',req.body.email)
      
        res.redirect('/forget-password');

    }//if worked else, user mail true
    else{
        
        try {
            const _user=await User.findOne({email:req.body.email,emailactive:true})

            //password reset email is sent to the user
            if (_user) {
                 //forget password jwt
                    const jwtinformaiton={
                    id:_user._id,
                    mail:_user.email
                }
                //secretkey
                const secret=process.env.RESET_PASSWORD_SECRET_KEY+"-"+_user.password;

                //jwttoken
                const jwtToken=jwt.sign(jwtinformaiton,secret,{expiresIn:'1d'})

                //mail sender procces
                const url=process.env.WEB_SITE_URL+'reset-password/'+_user._id+'/'+jwtToken;
                console.log("url"+url);

                let transporter=nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:process.env.GMAIL_USER,
                        pass:process.env.GMAIL_PASSWORD
                    }

                })

                await transporter.sendMail({
                    from:'nodejs app',
                    to:_user.email,
                    subject:'Reset password',
                    text:"Click on the link to reset password : "+ url
                },(error,info)=>{
                    if (error) {
                        console.log("mail send error "+error);
                    }
                    console.log("mail send succesfuly");
                    //console.log(info);
                    transporter.close();
                })
                req.flash('success_message',[{msg:'Please check your mailbox'}])

                res.redirect('/login');



            }//user not found
            else{
                req.flash('validation_error',[{msg:"E-mail is not registered or Inactive"}])
                req.flash('email',req.body.email)
                res.redirect('forget-password')

            }

        }catch(error){
            console.log(error);
        }

    }

   
}



const logout=(req,res,next)=>{
    req.logout();
    req.session.destroy((error)=>{
        res.clearCookie('connect.sid');
       // req.flash('success_message',[{msg:' Logout completed successfully'}]);
        res.render('login',{layout:'./layouts/auth_layout.ejs',succes_message:[{msg:'Logout completed successfully'}]});

    })
}

const verifyMail = (req,res,next)=>{
    const token = req.query.id;
    
    if (token) {
            try {
                jwt.verify(token,process.env.CONFIRM_MAIL_JWT_SECRET, async(e,decoded)=>{
                    if (e) {
                        req.flash('error','Incorrect link or out of date')
                        res.redirect('/login')
                    }
                    else{
                        
                    
                       const tokenid = decoded.id;
                      
                       const result = await User.findByIdAndUpdate(tokenid,{emailactive:true});

                        if (result) {
                            req.flash('success_message',[{msg:'mail confirmation successful'}])
                            res.redirect('/login');
                        }
                        else{
                            req.flash('error','Please create user again')
                            res.redirect('/login');
                        }
                       
                    }
                })
            } catch (error) {
                console.log(error);
            }
       

    }
    else{
        console.log("token yok");
    }

}


const NewPasswordForm=async(req,res,next)=>{
    const linkid=req.params.id;
    const linktoken=req.params.token;


    if (linkid&&linktoken) {
      
        const _findedUser=await User.findOne({_id:linkid});
        const secret=process.env.RESET_PASSWORD_SECRET_KEY+"-"+_findedUser.password;
        

            try {
               
                jwt.verify(linktoken,secret,async(e, decoded)=>{
                    if (e) {
                        req.flash('error','Incorrect link or out of date')
                       
                        res.redirect('/forget-password')
                    }
                    else{
                      res.render('new-password',{id:linkid,token:linktoken,layout:'./layouts/auth_layout.ejs'});                    
                    }
                })
            }catch(error){
                console.log(error);
            }

    }else{
        req.flash('validation_error',[{msg:"Please click the link in the email"}])
        req.flash('email',req.body.email)
        res.redirect('forget-password')
    }         
}

const  saveNewPassword=async(req,res,next)=>{
    const ErrArray=validationResult(req);

    if (!ErrArray.isEmpty()) {
        req.flash('validation_error',ErrArray.array());
        req.flash('password',req.body.password)
        req.flash('repassword',req.body.repassword)
      
        res.redirect('/reset-password/'+req.body.id+'/'+req.body.token);
        console.log(req.body);

       
    }else{
       
        const bodyid=req.body.id;
        const bodytoken=req.body.token;
    
    
        if (bodyid&&bodytoken) {
          
            const _findedUser=await User.findOne({_id:bodyid,emailactive:true});
    
            const secret=process.env.RESET_PASSWORD_SECRET_KEY+"-"+_findedUser.password;
    
            
                try {
                    jwt.verify(bodytoken,secret,async(e,decoded)=>{
                        if (e) {
                            req.flash('error','Incorrect link or out of date')
                           
                            res.redirect('/forget-password')
                        }
                        else{

                            //new password save
                            const hashedPassword=await bcrypt.hash(req.body.password,10);
                            const result =await User.findByIdAndUpdate(req.body.id,{password:hashedPassword});

                            if (result) {
                                req.flash('success_message',[{msg:'Password update successful'}])
                                res.redirect('/login');
                            }
                            else{
                                req.flash('error','Please do the password reset steps again')
                                res.redirect('/login');
                            }  
                
                        }
                    })
                }catch(error){
                    console.log(error);
                }
    
        }
    }
   
}


module.exports={
    showtoLoginPage,
    postthetoLoginPage,
    showtoRegisterPage,
    posttheRegisterPage,
    showtoForgetPassPage,
    posttheForgetPassPage,
    verifyMail,
    logout,
    NewPasswordForm,
    saveNewPassword
    
    
    
}
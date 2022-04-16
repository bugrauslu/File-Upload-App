const LocalStrategy=require('passport-local').Strategy;
const User=require('../model/usermodel');
const bcrypt=require('bcrypt');

module.exports=function(passport){

    const options={
        usernameField:'email',
        passwordField:'password'
    }
    passport.use(new LocalStrategy(options, async(email,password,done)=>{
        try {

            const _findedUser= await User.findOne({email:email})
            
                if (!_findedUser) {
                    return done(null,false,{message:'User not found'})
                }
                const passwordcheck=await  bcrypt.compare(password,_findedUser.password);
                
                if (!passwordcheck) {
                    return done(null,false,{message:'incorrect password'})
                }
                else{
                    if (_findedUser&&_findedUser.emailactive===false) {
                        return done(null,false,{message:'Please confirm your email'})
                    }else{
                        return done(null,_findedUser)
                    }
                   
                }

              

               

        } catch (error) {
            return done(error)
        }
    }));


    passport.serializeUser(function(user, cb) {
        process.nextTick(function() {
          cb(null, { id: user.id, email: user.email ,firstname:user.firstname,lastname:user.lastname });
        });
      });
      
      passport.deserializeUser(function(user, cb) {
        process.nextTick(function() {
          return cb(null, user);
        });
      });



}
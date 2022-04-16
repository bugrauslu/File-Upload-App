const SessionOpened=function(req,res,next){
    if (req.isAuthenticated()) {
        return next();
    }
    else{
        req.flash('error',['please login first'])
        res.redirect('/login')
    }
}



const SessionClosed=function(req,res,next){
    if (!req.isAuthenticated()) {
        return next();
    }
    else{
        
        res.redirect('/admin')
    }
}








module.exports={
    SessionOpened,
    SessionClosed
}
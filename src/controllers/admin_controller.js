const files=require('../model/filemodel')
const jwt=require('jsonwebtoken');
const path= require('path');
const fs = require('fs')

const showmainpage=(req,res,next)=>{

res.render('index', {layout:'./layouts/admin_layout.ejs'})

}

const showtoDownloadPage=async(req,res,next)=>{

    if (!req.file) {
        res.render('index',{layout:'./layouts/admin_layout.ejs'})
    }else{
        // console.log(req.user);
         const loginuserid=req.user.id;
         const filename=req.file.filename;

        //database 
        const file=new files({
            file:filename,
            uploaderid:loginuserid,
            
        })

         //jwtinformation
         const jwtinformaiton={
            id:file._id
        }

           //jwt token
        const jwttoken= jwt.sign(jwtinformaiton,process.env.CONFIRM_FILE_JWT_SECRET,{expiresIn:'1d'});
        //console.log("jwt token : "+jwttoken);
           
        
        //url
        const url=process.env.WEB_SITE_URL+'admin/download/?id='+jwttoken;
        //console.log("url :"+url);

         
       
        try {
            await file.save();
            await files.findByIdAndUpdate(file._id,{sharelink:url});  
            //all files of the active user
            const resultoffiles= await files.find({ uploaderid:req.user.id})
            
            //console.log(resultoffiles);

            //console.log(resultoffiles);
                 res.render('upload',{filename:filename,resultoffiles:resultoffiles,layout:'./layouts/admin_layout.ejs'})
          
        } catch (error) {
             console.log(error);
           }   
        }        
}


const showuploadedfilepage=async(req,res,next)=>{
   
    const resultoffiles= await files.find({ uploaderid:req.user.id})
    
    res.render('upload',{url:resultoffiles.sharelink ,  filename:resultoffiles.file  ,  resultoffiles:resultoffiles,   layout:'./layouts/admin_layout.ejs'})
}



const downloadedfile=(req,res,next)=>{
    token =req.query.id;
    console.log("token"+token );
    if (token) {
      try {
             secretkey=process.env.CONFIRM_FILE_JWT_SECRET
             jwt.verify(token,secretkey,async(e,decoded)=>{
          if (e) {
             console.log(e);
          }
          else{
              //fileid in jwt
             const tokenid=decoded.id;
            
             const result= await files.findById(tokenid)
             if (result) {
               
                const file =path.join(__dirname,'../uploads/'+result.file);

                //file download
                res.download(file);
                console.log("File downloaded"); 
             }
             else
            {
              console.log("Error downloading file");
            }
      
          }
      })
  
      } catch (error) {
        console.log(error);
      }
      
    }
}




const deleteFile=(req,res,next)=>{
  console.log(req.body);
  const filepath = path.join(__dirname, "../uploads/"+req.body.filename );
  console.log(filepath);

    fs.unlink(filepath, (err) => {
    if (err) {
      console.error(err)
      return
    }
    
    console.log("file removed");
    //file removed
  })
}





module.exports={
    showmainpage,
    showtoDownloadPage,
    showuploadedfilepage,
    downloadedfile,
    deleteFile
}

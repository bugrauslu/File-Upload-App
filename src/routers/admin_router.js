const router=require('express').Router();
const admincontroller=require('../controllers/admin_controller');
const adminMiddleware=require('../middlewares/auth_middleware');
const multerConfig=require('../config/multerconfig');

router.get('/',adminMiddleware.SessionOpened,admincontroller.showmainpage);

router.post('/upload',adminMiddleware.SessionOpened,multerConfig.single('file'),admincontroller.showtoDownloadPage)
router.get('/upload',adminMiddleware.SessionOpened,admincontroller.showuploadedfilepage)

router.get('/download',admincontroller.downloadedfile)
router.post('/download',admincontroller.downloadedfile)

router.post('/delete-file', admincontroller.deleteFile)

module.exports=router;
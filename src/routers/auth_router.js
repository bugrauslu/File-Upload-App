const router=require('express').Router();
const auth_Controller=require('../controllers/auth_controller');
const validationMiddleware=require('../middlewares/validation_middleware');
const adminMiddleware=require('../middlewares/auth_middleware');



router.get('/login',adminMiddleware.SessionClosed,auth_Controller.showtoLoginPage)
router.post('/login',adminMiddleware.SessionClosed,validationMiddleware.validateLogin(),auth_Controller.postthetoLoginPage)


router.get('/register',adminMiddleware.SessionClosed,auth_Controller.showtoRegisterPage)
router.post('/register',adminMiddleware.SessionClosed,validationMiddleware.validateNewUser(),auth_Controller.posttheRegisterPage)

router.get('/forget-password',adminMiddleware.SessionClosed,auth_Controller.showtoForgetPassPage)
router.post('/forget-password',adminMiddleware.SessionClosed,validationMiddleware.validateEmail(),auth_Controller.posttheForgetPassPage);

router.get('/verify',auth_Controller.verifyMail)

router.get('/reset-password/:id/:token',auth_Controller.NewPasswordForm)
router.get('/reset-password',auth_Controller.NewPasswordForm)

router.post('/reset-password',validationMiddleware.validateNewPassword(),auth_Controller.saveNewPassword)

router.get('/logout',adminMiddleware.SessionOpened,auth_Controller.logout);



module.exports=router;
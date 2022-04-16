const {body}=require('express-validator');

const validateNewUser=()=>{
    return[
        body('email')
        .trim()
        .isEmail().withMessage('Please enter a valid e-mail'),

        body('password')
        .trim()
        .isLength({min:6}).withMessage('The password should be 6 characters at least')
        .isLength({max:20}).withMessage('Password must be a maximum of 20 characters'),

        body('firstname')
        .trim()
        .isLength({min:2}).withMessage('first name must be at least 2 characters')
        .isLength({max:30}).withMessage('first name must be a maximum of 20 characters'),

        body('lastname')
        .trim()
        .isLength({min:2}).withMessage('last name must be at least 2 characters')
        .isLength({max:30}).withMessage('last name must be a maximum of 20 characters'),

        body('repassword').trim().custom((value,{req})=>{
            if (value!==req.body.password) {
                throw new Error('the passwords are not the same!!!');
            }
            return true;
        })
        

    ];

}



const validateEmail=()=>{
    return[
        body('email')
        .trim()
        .isEmail().withMessage('Please enter a valid e-mail')
    ]

}






const validateLogin=()=>{
    return[
        body('email')
        .trim()
        .isEmail().withMessage('Please enter a valid e-mail'),

        body('password')
        .trim()
        .isLength({min:6}).withMessage('The password should be 6 characters at least')
        .isLength({max:20}).withMessage('Password must be a maximum of 20 characters'),

    ];

}





const validateNewPassword=()=>{
    return[
        body('password')
        .trim()
        .isLength({min:6}).withMessage('The password should be 6 characters at least')
        .isLength({max:20}).withMessage('Password must be a maximum of 20 characters'),


        body('repassword').trim().custom((value,{req})=>{
            if (value!==req.body.password) {
                throw new Error('the passwords are not the same!!!');
            }
            return true;
        })
    ];
}








module.exports={
    validateNewUser,
    validateLogin,
    validateEmail,
    validateNewPassword
}
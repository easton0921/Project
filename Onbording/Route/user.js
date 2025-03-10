const express = require('express');
const {jwtMiddleware,}= require('../middleware/jwt');
const { uploadSingle, uploadMultiple } = require('../middleware/multer');
 
const {handleUserSignup ,handleGetAllUser,handleOtp ,handleGetUserVerity,
    loginProfile,update,logout,changePassword,forgetPassword,resetPassword,singleFileUpload,getSchoolId,getAllUser,insertMany,
} = require('../Controllers/user')
const router = express.Router();
router.post('/signup',handleUserSignup);
router.get('/get-profile',jwtMiddleware,handleGetAllUser);
router.get('/otp',handleOtp);
router.post('/otp-verify', jwtMiddleware,handleGetUserVerity);
router.post('/login-profile',loginProfile)
router.post('/update',jwtMiddleware,update)
router.get('/logout',jwtMiddleware,logout)
router.post('/change-password',jwtMiddleware,changePassword)
router.post('/forget-password',forgetPassword)
router.post('/reset-password',resetPassword)
router.post("/file-upload", uploadMultiple,singleFileUpload,)
router.get('/getSchoolId',jwtMiddleware,getSchoolId)
router.get('/get-all-user',getAllUser)
router.post('/insertMany',insertMany)
module.exports = router;



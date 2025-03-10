const express = require('express');
const {signup,handledelete,} = require('../Controllers/otp')
const {otpCreate} = require('../utility/common')
const router = express.Router();
router.post('/',signup,);
router.get('/',otpCreate)
//router.get('/',handleGetOtp)
router.delete('/:id',handledelete)

module.exports = router;

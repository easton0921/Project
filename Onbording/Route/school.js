const express = require('express')
const {studentEntery,getAllStudent,singleStudent,update,delStudent, } = require('../Controllers/school')
const {jwtMiddleware,}= require('../middleware/jwt');
const router = express.Router()
router.post('/signin',jwtMiddleware,studentEntery)
router.get('/get-all',getAllStudent)
router.get('/get-one/:id',singleStudent)
router.patch('/update/:id',update)
router.delete('/delete/:id',delStudent)


module.exports = router

const express = require('express');
const User = require('../Models/user');
const UserOtp = require('../Models/otp');
const otpService = require('../utility/otp');
const bcrypt = require('../utility/password')
const jwt = require('../utility/jwt');
const jti = require('../utility/common')


//verify email and phone 
async function handleGetUserVerity(req, res) {

  try {
    const id = req.user._id;

    const { username, email, phone, countryCode, otp } = req.body;
    console.log("req", req.body)

    let obj = { verifyToken: id, username: username };
    if (email && otp) {
      const emailAndOtp = await UserOtp.findOne({ email, otp });
      if (!emailAndOtp) {
        return res.status(404).json({ status: 'Email and otp not exist' });
      }
      const emailAndOtpDelete = await UserOtp.deleteMany({ email })
      obj.emailVerify = true;
    }
    else if (phone && countryCode && otp) {
      const phoneAndOtp = await UserOtp.findOne({ phone, countryCode, otp });
      console.log('phoneAndOtp:', phoneAndOtp)
      if (!phoneAndOtp) {
        return res.status(404).json({ status: 'phone and otp not exist' });
      }
      const phoneAndOtpDelete = await UserOtp.deleteMany({ phone, countryCode })
      obj.phoneVerify = true;
      // res.status(200).json({status:'otp verify'})
    }
    else {
      res.status(404).json({ status: "required data" })
    }
    //db find data
    const dbStore = await User.findByIdAndUpdate(obj.verifyToken, obj, { new: true })
    console.log("obj ", obj)
    console.log('dbStore:', dbStore)
    if (!dbStore) {
      return res.status(404).json({ status: 'db not exist' });
    }
    res.status(200).json({ status: 'otp verify', dbStore })

  } catch (error) {
    console.log('error:', error)
    res.status(500).json({ error: "error" })
  }
};

//email otp or phone otp send 
async function handleUserSignup(req, res) {
  try {
    const { username, phone, countryCode, email, password } = req.body;
    let obj = { username: username };
    let x =await jti.regex(email);
    if(!x){
      console.log('x,x',x)
       return res.status(400).json({status:"Eamil is not proper"})
    }
    if (email) {
      if (await User.findOne({ email, emailVerify: true })) {
        return res.status(400).json({ status: "email already exist" })
      }
      let JTI = await jti.generateRandomString()
      obj.jti = JTI
      let checkDataExist = await User.find({ email, emailVerify: false }).deleteMany()
      let otpEmail = await otpService.otpForEmail(email)
      let pass = await bcrypt.hashPassword(password)
      console.log('hash', pass)
      obj.email = email
      obj.password = pass
      obj.otp = otpEmail
    } else if (phone && countryCode) {
      if (await User.findOne({ phone, countryCode, phoneVerify: true })) {
        return res.status(400).json({ status: "phone number already exist" })
      }
      let JTI = await jti.generateRandomString()
      obj.jti = JTI
      let checkDataExist = await User.find({ phone, countryCode, phoneVerify: false }).deleteMany()
      let phoneOtp = await otpService.otpForPhone(phone, countryCode)
      let hash = await bcrypt.hashPassword(password)
      console.log('hash', hash)
      obj.phone = phone
      obj.countryCode = countryCode
      obj.password = hash
      obj.otp = phoneOtp
    } else {
      res.status(400).json({ status: "required email or phone, countryCode..!" })
    }
    console.log('error', obj)
    const dbStore = await User.create(obj)//user store data
    console.log('JTI', dbStore.jti)
    const token = jwt.genToken({ id: dbStore._id, jti: dbStore.jti })
    const otpStoredb = await UserOtp.create(obj)//db store data 

    res.status(200).json({ status: "otp send", token: token, jti: dbStore.jti })


  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ status: 'error' });
  }
};

//find token get find
async function handleGetAllUser(req, res) {
  try {

    const id = req.user._id
    console.log('id is ', id)
    const jti = id.jti
    console.log('id is', jti)

    const allDbUser = await User.findOne(id, jti)
    console.log('db', allDbUser)
    if (!allDbUser) {
      return res.status(404).json({ status: 'invalid token' })
    } else {
      return res.status(200).json({ status: allDbUser })
    }
  } catch (error) {
    console.log(error)
    res.status(404).json({ status: 'error...' })
  }
};

//otp get data
async function handleOtp(req, res) {
  try {
    const allDbUser = await UserOtp.find({})
    return res.json(allDbUser)
  } catch (error) {
    console.log(error)
    res.status(404).json({ status: 'error' })
  }
};

//Get -Profile
async function loginProfile(req, res) {
  // console.error('errowwwwr')
  try {
    // console.error('errowwwwr2')
    const { email, phone, countryCode, password } = req.body
    let obj = {};
    if (email && password) {
      const db = await User.findOne({ email, emailVerify: true })
      if (!db) {
        return res.status(404).json({ status: 'email not exist' })
      }

      let hash = db.password;//get password for db
      const passwordMatch = await bcrypt.checkPassword(password, hash)//match password 
      console.log('password', passwordMatch)
      obj.password = passwordMatch;
      let newJti = await jti.generateRandomString();
      let dbSaveJti = await User.findByIdAndUpdate(db._id, { jti: newJti }, { new: true })
      let token = await jwt.genToken({ id: db._id, jti: newJti })
      console.log('jti', dbSaveJti)
      // console.error('')
      if (passwordMatch === true) {
        res.status(200).json({ status: 'Login Success', token: token, jti: newJti })
      } else if (passwordMatch === false) {
        res.status(200).json({ status: 'Invalid password..' })
      } else {
        res.status(404).json({ status: 'password required..!' })
      }
    }
    else if (phone && countryCode && password) {
      const db = await User.findOne({ phone, countryCode, phoneVerify: true })
      if (db === null) {
        return res.status(404).json({ status: 'phone,countryCode not exist' })
      }
      let hash = db.password;
      const passwordMatch = await bcrypt.checkPassword(password, hash)
      console.log('password', passwordMatch)
      console.log("hash", hash)
      obj.password = passwordMatch;
      const newJti = await jti.generateRandomString()//========jti=====
      console.log(newJti);
      let token = await jwt.genToken({ id: db._id, jti: newJti })//============token==

      let dbSaveJti = await User.findByIdAndUpdate(db._id, { jti: newJti }, { new: true })
      console.log('dbjti', dbSaveJti)
      if (passwordMatch === true) {
        res.status(200).json({ status: 'Login Success', token: token, jti: newJti })
      } else if (passwordMatch === false) {
        res.status(200).json({ status: 'Invalid password..' })
      } else {
        res.status(404).json({ status: 'password required..!' })
      }
    }
    else return res.status(404).json({ status: 'requir valid data..!' });
  }
  catch (err) {
    console.error('error login function ', err)
    res.status(500).json({ status: 'error' })
  }
};

// get token and update
async function update(req, res) {
  try {
    const id = req.user._id
    const { username } = req.body;
    let updateData = await User.findByIdAndUpdate(id, req.body, { new: true });
    const jti = req.user.jti
    console.log('jti', jti)
    res.status(200).json({ id, status: updateData, jti: jti })

  } catch (error) {
    console.log('error', error);
    res.status(500).json({ status: 'error' })
  }
};

//logout
async function logout(req, res) {
  try {
    const id = req.user._id;
    const jtiDel = req.user.jti;
    console.log('blank', jtiDel)
    let db = await User.findByIdAndUpdate(id, { jti: '' }, { new: true })
    res.status(200).json({ status: 'User logout success' })
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ status: 'error' })
  }
};

//Change password
async function changePassword(req, res) {

  try {
    const { newPassword, email, phone } = req.body

    const obj = {};
    const db = req.user;
    const id = db._id;
    const hash = db.password;
    console.log('id for db', id)
    // const hash = db.password;
    if (email && req.body.password) {
      const password = req.body.password
      const findId = await User.findOne(id, { email: req.body.email, emailVerify: true })
      if (!findId) {
        return res.status(404).json({ status: 'User not found!' })
      }
      const checkPassword = await bcrypt.checkPassword(password, hash)//password match
      if (!checkPassword) {
        return res.status(404).json({ status: "Wrong password." })
      }
      let password1 = newPassword;
      console.log('new password', password)
      let bcrPass = await bcrypt.hashPassword(password1)
      const newPass = await User.findByIdAndUpdate(id, { password: bcrPass })
      return res.status(200).json({ status: 'Password change success' })
    }

    else if (phone && req.body.password) {
      const password = req.body.password
      const findId = await User.findOne(id, { phone: req.body.phone, phonelVerify: true })
      if (!findId) {
        return res.status(404).json({ status: 'invalid user..!' })
      }
      const checkPassword = await bcrypt.checkPassword(password, hash)//password match
      if (!checkPassword) {
        return res.status(404).json({ status: "Invalid password." })
      }
      let password1 = newPassword;
      console.log('new password', password)
      let bcrPass = await bcrypt.hashPassword(password1)
      const newPass = await User.findByIdAndUpdate(id, { password: bcrPass })
      return res.status(200).json({ status: 'Password change success' })
    }
    else {
      return res.status(404).json({ status: 'data required' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 'error' })
  }
};

//forget password
async function forgetPassword(req, res) {
  try {
    const { email, phone, countryCode } = req.body;
    let obj = {}
    if (email) {
      let checkDataExist = await User.findOne({ email, emailVerify: false }).deleteMany()
      const otpGen = await otpService.otpForEmail(email)
      obj.email = email
      obj.otp = otpGen
      console.log('opt', otpGen)
    } else if (phone && countryCode) {
      let checkDataExist = await User.find({ phone, countryCode, phoneVerify: false }).deleteMany()
      const otpGen = await otpService.otpForPhone(phone, countryCode)
      console.log('PHONE', otpGen)
      obj.phone = phone
      obj.countryCode = countryCode
      obj.otp = otpGen
    } else {
      return res.status(400).json({ status: 'Required data...' })
    }
    const otpSve = await UserOtp.create(obj)
    return res.status(200).json({ status: 'otp send success' })

  } catch (error) {
    console.log('error ', error)
  }
};

//reset password 
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const matchOtp = await UserOtp.findOne({ email, otp })
    if (!matchOtp) {
      console.log('wrong otp ', matchOtp)
      res.status(400).json({ status: "wrong otp..!" })
    }
    let data = await User.findOne({ email: req.body.email, emailVerify: true })
    console.log('data', data)
    let id = data._id;
    console.timeLog("this is the id of change password of db ", id)
    const pass = await bcrypt.hashPassword(newPassword)
    console.log('new hash ', pass)

    const updateHash = await User.findByIdAndUpdate(id, { $set: { password: pass } })
    console.log("update hash", updateHash);
    const emailAndOtpDelete = await UserOtp.deleteMany({ email })//////////////////////////////////////////
    res.status(200).json({ status: "password change success" })

  } catch (error) {
    console.log('error ha bhai', error)
  }
}

// Upload Single File Multer
function singleFileUpload(req, res) {
  if (!req.file) {
    console.log("no file upload error",req.file)
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
};

// //lookup//aggregate
async function getSchoolId(req, res) {

  const user = await User.aggregate([

    {
      $lookup: {
        from: "schools",        // Collection to join with
        localField: "schoolId", // Field in 'schools'
        foreignField: "_id",    // Field in 'user'
        as: "schoolDetails"
      }
    },
    { $unwind: "$schoolDetails" },
    {
      $project: {
        _id: 1,
        username: 1,
        email: 1,
        schoolName: "$schoolDetails.name",
        schoolLocation: "$schoolDetails.location",
        schoolId: 1
      }
    }

  ])
  if (!user.length) {
    return res.status(404).json({ message: "No school found" });
  }
  res.status(200).json({ user: user })

}

//====================populate=========
//  async function getSchoolId(req, res) {
//   try {
//     const user = await User.find({}).populate("schoolId");

//     if (!user.length) {
//       return res.status(404).json({ message: "No school found" });
//     }

//    res.status(200).json({ user });
//  } catch (error) {
//    console.log(error)
//    res.status(500).json({ message: "Server error", error });
//  }
// }

//all user get 
async function getAllUser(req, res) {
  try {
    const allUser = await User.find({});
    const count = await User.countDocuments({});
    const user = await User.aggregate([
      {
        $lookup:
        {
          from: "schools",
          // localField: "schoolId",
          // foreignField: "_id",
          let: { schoolId: "$schoolId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$schoolId"] }
              }
            },
          ],
          as: "schoolDetails"
        }
      },
      {
        $unwind: {
          path: "$schoolDetails",//size
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          "schoolDetails.name": 1
        }
      },
      // {
      //   $group: {
      //     _id: "$gender",
      //     count: {
      //       $sum: 1
      //     }
      //   }
      // }
    ])

    res.status(200).json({ status: "Success", user: user, count: count });
  } catch (error) {
    
    console.log('error in getAllUser function...........', error);
    res.status(500).json({ status: "error" })
  }
};

//idexing and insert many
async function insertMany(req,res){
  try {
    const {username,age,gender,email} = req.body;
    const user = await User.insertMany(req.body)
    if(!user){
      console.log(" not user ",user)
      res.status(400).json({status:"user not found"})
    }
    else{
      console.log('user',user);
      res.status(200).json({status:"success",user:user})
    }
  } catch (error) {
    console.log("error ha bhai indexing function ma",error)
    res.status(400).json({status:"error"})
  }
};


module.exports = {
  handleUserSignup,
  handleGetUserVerity,
  handleGetAllUser,
  handleOtp,
  loginProfile,
  update,
  logout,
  changePassword,
  forgetPassword,
  singleFileUpload,
  resetPassword,
  getSchoolId,
  getAllUser,
  insertMany,
}

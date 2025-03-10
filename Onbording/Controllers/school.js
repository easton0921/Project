const express = require('express')
const School = require('../Models/school')
const User = require('../Models/user')
const app = express()
const Mongoose=require("mongoose")

app.use(express.json())
//school signin 
async function studentEntery(req,res){
    try {
       console.log(req.user.id)
        const user = await User.findOne({_id: new Mongoose.Types.ObjectId(req.user.id)})
        console.log('user valid data',user)
        const idu = user._id;
        console.log('id',idu)
        if(!user){
            return res.status(404).json({status:'Invalid user'})
        }
        const {name,address,board} = req.body;
        const obj = {}
        if(name&&address&&board){
            obj.name=name
            obj.address=address
            obj.board=board
            // obj.schoolId=req.user.id
        }
        else{
            res.status(404).json({status:"require data"})
        }
        const dataDb = await School.create(obj)
        console.log('dataDbSchoolid',dataDb._id)
        
        const schoolID = await User.findByIdAndUpdate(idu,{schoolId:dataDb._id},{new: true})
        console.log('db store',dataDb)
            res.status(200).json({status:'Success'})
        
    } catch (error) {
        console.log('error ha bhai studentEntery function ma ',error)
        res.status(500).json({status:"error"})
    }
};

// get all in array
async function getAllStudent(req,res){
    try {
        const dbSchool = await School.find({});
        const count = await School.countDocuments({});
        console.log("db ",dbSchool)
        res.status(200).json({status:dbSchool,count:count});

        
    } catch (error) {
        console.log("error ha bhai getAllStudent function ma ",error)
        res.status(500).josn({status:"error"})
    }

};

//get single id
async function singleStudent(req,res){
    try {
       const student = await School.findById(req.params.id)
       console.log('student',student)
       if(!student){
        console.log("not contain id",student)
       return  res.status(404).json({status:'user not match'})
       }
       res.status(200).json({status:student})

    } catch (error) {
        console.log('Eroor ha bhai singleStudent function ma ',error)
        res.status(500).json({status:"error"})
    }
}

//get id and update\
async function update(req,res){
    const body = req.body;//request of body
    if(!req.params.id){
        res.status(404).json({status:'invalid id'})
    }
    const user = await School.findByIdAndUpdate(req.params.id,
      { $set: {
        name:body.name,
        board:body.board,
        address:body.address,
        }
    },{new:true}
    );
    console.log(user)
    return res.json({status:"Success",update:user})
};

//delete 
async function delStudent(req, res) {
    try {
        const student = await School.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ status: 'Student not found' });
        }
        console.log('delete ',student)
        return res.status(200).json({ status: 'Success', message: 'Student deleted successfully' });
    } catch (error) {
        console.log('Error in delete function:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};



module.exports = {
    studentEntery,
    getAllStudent,
    singleStudent,
    update,
    delStudent,
}

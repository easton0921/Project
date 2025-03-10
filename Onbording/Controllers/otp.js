const User = require('../Models/otp');
const bcrypt = require('bcrypt')


async function signup(req,res){
 bcrypt.hash(req.body.password,10,(err,hash)=>{
    if(err){
        return res.status(500).json({
            error:err
        })
    }
    else{
        const user = new User({
            username:req.body.username,
            password:hash,
            phone:req.body.phone,
            email:req.body.email
        })
        user.save()
        .then(result=>{
          return res.status(200).json({new_status:result})
        })
        .catch(err=>{
          return  res.status(500).json({error:err})
        })
    }
  })
}
//delete request by id 
async function handledelete(req,res){
    User.deleteOne({_id:req.params.id})
    .then(result=>{
        res.status(200).json({
            message:"Data delete",
            result:result
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
}
module.exports = {
    signup,
    handledelete,
}

const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
    },
    countryCode:{
        type:String,
    },
    phone:{
        type:String,
        unique:true, 
    },
    password:{
        type:String
    },
    emailVerify:{
        type:String,
        default:false,
    },
    emailNotVerify:{
        type:String,
    },
    phoneVerify:{
        type:String,
        default:false,
    },
    phoneNotVerify:{
        type:String,
    },
    gender:{
        type:String,
    },
    jti:{
        type:String,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "school"
    },
    age: {
        type: String,
    },

})
// Create Index on "email" field for faster lookups
// userSchema.index({ email: 1 });
const User = mongoose.model('user',userSchema)
module.exports = User


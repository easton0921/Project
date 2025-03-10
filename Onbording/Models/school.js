const mongoose = require('mongoose')
const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    board: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    count: {
        type: Number,
    },
});
const School = mongoose.model('school', schoolSchema)
module.exports = School

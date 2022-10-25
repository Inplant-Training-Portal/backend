
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// student schema
const StudentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    enrollment_no: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mentor: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    mobile_no: {
        type: String,
        unique: true
    },
    documents: {
        type: Array
    },
    date: {
        type: Date,
        default: Date.now
    }

});

// export student model
module.exports = mongoose.model('Student', StudentSchema);

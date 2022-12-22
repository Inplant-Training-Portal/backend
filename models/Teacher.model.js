const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// teacher schema
const TeacherSchema = new Schema({
    // TEACHER DETAILS
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // TEACHER CONTACT DETAILS
    email: {
        type: String,
        required: true
    },
    mobile_no: {
        type: Number,
        required: true
    },
    // STUDENTS ALLOCATED
    students: {
        type: Array
    }

});

// export teacher model
module.exports = mongoose.model('Teacher', TeacherSchema);


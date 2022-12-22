const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// student schema
const StudentSchema = new Schema({
    // STUDENT DETAILS
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
    // STUDENT CONTACT DETAILS
    email: {
        type: String,
    },
    mobile_no: {
        type: String,
    },
    // FACULTY MENTOR DETAILS
    faculty_mentor: {
        name: String,
        email: String,
        mobile_no: Number
    },
    // ORGANIZATION MENTOR DETAILS
    organization_mentor: {
        name: String,
        mentor_name: String,
        mentor_email: String
    },
    // DOCUMENTS
    documents: {
        type: Array
    },
    // MARKS
    faculty_marks: {
        type: Array
    },
    industry_marks: {
        type: Array
    },
    // LAST UPDATED
    date: {
        type: Date,
        default: Date.now
    }

});

// export student model
module.exports = mongoose.model('Student', StudentSchema);

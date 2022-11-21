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
    faculty_mentor_name: {
        type: String
    },
    faculty_mentor_email: {
        type: String
    },
    faculty_mentor_mobile_no: {
        type: String
    },
    // ORGANIZATION MENTOR DETAILS
    organization_name: {
        type: String
    },
    organization_mentor_name: {
        type: String
    },
    organization_mentor_email: {
        type: String
    },
    // DOCUMENTS
    documents: {
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

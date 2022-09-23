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
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mentor: {
        type: String
    },
    email: {
        type: String
    },
    mobile_no: {
        type: String
    }
});

// export student model
module.exports = mongoose.model('Student', StudentSchema);


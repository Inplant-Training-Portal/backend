const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// admin schema
const Admin = new Schema({
    // ADMIN DETAILS
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
    // ADMIN CONTACT DETAILS
    email: {
        type: String
    },
    mobile_no: {
        type: Number
    }
});

// export admin model
module.exports = mongoose.model('Admin', Admin);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// admin schema
const AdminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    mobile_no: {
        type: String
    }
});

// export admin model
module.exports = mongoose.model('Admin', AdminSchema);

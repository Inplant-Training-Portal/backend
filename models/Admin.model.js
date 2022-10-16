const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// admin schema
const AdminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// export admin model
module.exports = mongoose.model('Admin', AdminSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// org schema
const OrgSchema = new Schema({
    userid: {
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
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    }
});

// export admin model
module.exports = mongoose.model('Org', OrgSchema);

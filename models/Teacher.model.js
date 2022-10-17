
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// teacher schema
const TeacherSchema = new Schema({
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
    students: {
        type: Array
    }
});

// export teacher model
module.exports = mongoose.model('Teacher', TeacherSchema);


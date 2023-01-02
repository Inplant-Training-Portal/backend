const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FacultyMarks = new Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    marks: [
        {
            month: {
                type: String,
                required: true
            },
            discipline: {
                type: Number,
                required: true
            },
            attitude: {
                type: Number,
                required: true
            },
            maintenance: {
                type: Number,
                required: true
            },
            report: {
                type: Number,
                required: true
            },
            achievement: {
                type: Number,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('FacultyMarks', FacultyMarks);
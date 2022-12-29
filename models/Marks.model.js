const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// teacher schema
const MarksSchema = new Schema({
    // DETAILS
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    marks: [
        {
            discipline: {
                type: String,
                required: true
            },
            attitude: {
                type: String,
                required: true
            },
            maintenance: {
                type: String,
                required: true
            },
            report: {
                type: String,
                required: true
            },
            achievement: {
                type: String,
                required: true
            }
        }
    ]
});

// export teacher model
module.exports = mongoose.model('Marks', MarksSchema);
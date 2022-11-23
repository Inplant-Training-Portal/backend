const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// teacher schema
const MarksSchema = new Schema({
    // DETAILS
    student: {
        type: String,
        required: true
    },
    marks: {
        type: Array
    }
});

// export teacher model
module.exports = mongoose.model('Marks', MarksSchema);


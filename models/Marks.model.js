const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// teacher schema
const MarksSchema = new Schema({
    // DETAILS
    student: {
        type: String,
        required: true
    },
    discipline: {
        type: String,
    },
    attitude: {
        type: String,
    },
    maintenance: {
        type: String,
    },
    report: {
        type: String,
    },
    achievement: {
        type: String,
    }
});

// export teacher model
module.exports = mongoose.model('Marks', MarksSchema);
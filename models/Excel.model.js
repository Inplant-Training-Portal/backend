const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// excel schema
const ExcelSchema = new Schema({
    originalname: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    url: {
        type: String
    }
});

// export admin model
module.exports = mongoose.model('Excel', ExcelSchema);

const mongoose = require("mongoose")

const File = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    files: [
        {
            name: {
                type: String,
                required: true
            },
            fileId: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ]
})

module.exports = mongoose.model("File", File)
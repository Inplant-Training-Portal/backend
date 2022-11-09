const mongoose = require("mongoose")

const File = new mongoose.Schema({
    title:{
        type:String
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student"
    },
  path: {
    type: String,
    required: true
},
originalname: {
    type: String,
    required: true
},url: {
    type: String}
})

module.exports = mongoose.model("File", File)
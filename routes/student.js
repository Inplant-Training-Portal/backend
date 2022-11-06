// student router
const express = require('express');
const router = express.Router();

// import student controller
const studentController = require('../controllers/student.controller');

const temp = () => {
    console.log('nothing')
}

// login student
router.post('/login', studentController.loginStudent);

// update student profile
router.post('/update/info/:id', studentController.updateStudentInfo);

// change password
router.post('/update/password/:id', studentController.changeStudentPassword);

// get teacher profile
router.get('/teacher/:id', studentController.getTeacherProfile);

// upload document
// router.post('/file/upload',studentController.uploadFile);

// // download document
// router.get('/uploads/:id',studentController.downloadFile);

const multer = require('multer');
const File = require('../models/File.model');
const Student = require('../models/Student.model');
const upload = multer({ dest: 'uploads/' });

router.post("/file/upload/:id", upload.single('file'), async (req, res) => {
    const {originalname,path} = req.file;
    const fileData = new File({
        title:req.body.title,
        path: path,
        originalname: originalname,
        url:"http://localhost:9000/student/"+path
    });

    const file = await File.create(fileData);

    Student.findById(req.params.id)
    .then((student)=>{
        student.documents.push(file._id);
        student.save()

        file.owner=student._id
        file.save()
    })

    res.status(201).json({message:"File uploaded sucessfully",file});
});

router.get('/uploads/:id',(req, res) =>{
        File.findOne({path:`uploads/${req.params.id}`})
        .then((file)=>{
            if(file){
                res.status(201).json({message:"downloading...",file}).download(`uploads/${req.params.id}`,file.originalname)
            }else{
                res.status(404).json({message:'File not found'});
            }
        })
    });

// update contact
// router.put('/update/:id',studentController.updateContact)

// export router
module.exports = router;

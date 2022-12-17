// student router
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// import student controller
const studentController = require('../controllers/student.controller');

// login student
router.post('/login', studentController.loginStudent);

// update student profile
router.post('/update/info/:id', studentController.updateStudentInfo);

// change password
router.post('/update/password/:id', studentController.changeStudentPassword);

// get teacher profile
router.get('/teacher/:id', studentController.getTeacherProfile);

// upload document
router.post("/file/upload/:id", upload.single('file'), studentController.uploadFile);

// map document
router.get("/file/map/:id", studentController.mapFile);


// export router
module.exports = router;

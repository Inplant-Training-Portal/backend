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

// get student profile
// router.get('/profile/:id', studentController.getStudentProfile);

// get teacher profile
router.get('/teacher/:id', studentController.getTeacherProfile);

// upload and dowbload files
router.post('/file/upload', studentController.uploadFile);
router.get('/file/view/:id', studentController.viewFile);
router.get('/file/download/:id', studentController.downloadFile);

// update contact
// router.put('/update/:id',studentController.updateContact)

// export router
module.exports = router;

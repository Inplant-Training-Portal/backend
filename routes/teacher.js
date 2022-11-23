// import express
const express = require('express');
const router = express.Router();

// import teacher controller
const teacherController = require('../controllers/teacher.controller');

// login teacher
router.post('/login', teacherController.loginTeacher);

// update teacher profile
router.post('/update/info/:id', teacherController.updateTeacherInfo);

// change password
router.post('/update/password/:id', teacherController.changeTeacherPassword);

// get teacher profile
// router.get('/profile/:id', teacherController.getTeacherProfile);

// get all students
router.get('/students/list', teacherController.getStudentsList);

// get allocated students list
router.get('/allocated-students/:teacherName', teacherController.getAllocatedStudentsListByTeacherName);

// get student profile
router.get('/student-profile/:id', teacherController.getStudentProfile);

// update teacher profile
router.put('/profile/:id', teacherController.updateTeacherProfile);

// view files
router.get('/file/view/:id', teacherController.viewFile);

// download files
router.get('/file/download/:id', teacherController.downloadFile);

// send email
router.post('/send-email', teacherController.sendMail);

// send details
router.get('/send-details/:studentName', teacherController.sendDetails);

// get and upload details
router.post('/upload-details/:studentName', teacherController.getAndUploadDetails);


// export router
module.exports = router;
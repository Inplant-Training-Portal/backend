// import express
const express = require('express');
const router = express.Router();

// import teacher controller
const teacherController = require('../controllers/teacher.controller');

// login teacher
router.post('/login', teacherController.loginTeacher);

// update teacher profile
router.post('/update/info/:id', teacherController.updateTeacherInfo);

// get teacher profile
// router.get('/profile/:id', teacherController.getTeacherProfile);

// get student profile
router.get('/student-profile/:id', teacherController.getStudentProfile);

// update teacher profile
router.put('/profile/:id', teacherController.updateTeacherProfile);

// view files
router.get('/file/view/:id', teacherController.viewFile);

// download files
router.get('/file/download/:id', teacherController.downloadFile);


// export router
module.exports = router;
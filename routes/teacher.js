// import express
const express = require('express');
const router = express.Router();

// import teacher controller
const teacherController = require('../controllers/teacher.controller');

// login teacher
router.post('/login', teacherController.login);

// get teacher profile
router.get('/profile/:id', teacherController.getTeacherProfile);

// get student profile
router.get('/student-profile/:id', teacherController.getStudentProfile);


// export router
module.exports = router;
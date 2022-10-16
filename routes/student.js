// student router
const express = require('express');
const router = express.Router();

// import student controller
const studentController = require('../controllers/student.controller');

// login student
router.post('/login', studentController.login);

// get student profile
router.get('/profile/:id', studentController.getStudentProfile);

// get teacher profile
router.get('/teacher-profile/:id', studentController.getTeacherProfile);


// export router
module.exports = router;
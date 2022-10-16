// import express
const express = require('express');
const router = express.Router();

// import teacher controller
import {
    login,
    getTeacherProfile,
    getStudentProfile
} from '../controllers/teacher.controller';

// login teacher
router.post('/login', login);

// get teacher profile
router.get('/profile/:id', getTeacherProfile);

// get student profile
router.get('/student-profile/:id', getStudentProfile);


// export router
module.exports = router;
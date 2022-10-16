// student router
const express = require('express');
const router = express.Router();

// import student controller
import {
    login,
    getStudentProfile,
    getTeacherProfile
} from '../controllers/student.controller';

// login student
router.post('/login', login);

// get student profile
router.get('/profile/:id', getStudentProfile);

// get teacher profile
router.get('/teacher-profile/:id', getTeacherProfile);


// export router
module.exports = router;
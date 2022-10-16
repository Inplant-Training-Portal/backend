// admin router
const express = require('express');
const router = express.Router();

// import admin controller
import {
    test,
    registerAdmin,
    loginAdmin,
    getAdminById,
    getAllAdmins,
    addStudent,
    deleteStudent,
    getStudentDetails,
    getStudentsList,
    addTeacher,
    deleteTeacher,
    getTeacherDetails,
    getTeachersList,
    allocateStudent,
    getAllocatedStudentsList,
    getUnallocatedStudentsList,
    getAllocatedTeachersList,
    getUnallocatedTeachersList,
    getAllocatedStudentsListByTeacherName
} from '../controllers/admin.controller';

// test route
router.get('/test', test);

// register admin
router.post('/register', registerAdmin);

// login admin
router.post('/login', loginAdmin);

// get admin by id
router.get('/:id', getAdminById);

// get all admins
router.get('/list', getAllAdmins);

// add student
router.post('/add-student', addStudent);

// delete student
router.post('/delete-student/:id', deleteStudent);

// get student details
router.get('/student/:id', getStudentDetails);

// get students list
router.get('/student/list', getStudentsList);

// add teacher
router.post('/add-teacher', addTeacher);

// delete teacher
router.post('/delete-teacher/:id', deleteTeacher);

// get teacher details
router.get('/teacher/:id', getTeacherDetails);

// get teachers list
router.get('/teacher/list', getTeachersList);

// allocate student
router.post('/allocate-student', allocateStudent);

// get allocated students list
router.get('/allocated-students', getAllocatedStudentsList);

// get unallocated students list
router.get('/unallocated-students', getUnallocatedStudentsList);

// get allocated teachers list
router.get('/allocated-teachers', getAllocatedTeachersList);

// get unallocated teachers list
router.get('/unallocated-teachers', getUnallocatedTeachersList);

// get allocated students list by teacher name
router.get('/allocated-teacher/:name', getAllocatedStudentsListByTeacherName);


// export admin router
module.exports = router;
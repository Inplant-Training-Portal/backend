// admin router
const express = require('express');
const router = express.Router();

// import admin controller
const adminController = require('../controllers/admin.controller.js');

// test route
router.get('/test', adminController.test);

// register admin
router.post('/register', adminController.registerAdmin);

// login admin
router.post('/login', adminController.loginAdmin);

// get admin by id
router.get('/:id', adminController.getAdminById);

// get all admins
router.get('/list', adminController.getAllAdmins);

// add student
router.post('/add-student', adminController.addStudent);

// delete student
router.post('/delete-student/:id', adminController.deleteStudent);

// get student details
router.get('/student/:id', adminController.getStudentDetails);

// get students list
router.get('/student/list', adminController.getStudentsList);

// add teacher
router.post('/add-teacher', adminController.addTeacher);

// delete teacher
router.post('/delete-teacher/:id', adminController.deleteTeacher);

// get teacher details
router.get('/teacher/:id', adminController.getTeacherDetails);

// get teachers list
router.get('/teacher/list', adminController.getTeachersList);

// allocate student
router.post('/allocate-student', adminController.allocateStudent);

// get allocated students list
router.get('/allocated-students', adminController.getAllocatedStudentsList);

// get unallocated students list
router.get('/unallocated-students', adminController.getUnallocatedStudentsList);

// get allocated teachers list
router.get('/allocated-teachers', adminController.getAllocatedTeachersList);

// get unallocated teachers list
router.get('/unallocated-teachers', adminController.getUnallocatedTeachersList);

// get allocated students list by teacher name
router.get('/allocated-teacher/:name', adminController.getAllocatedStudentsListByTeacherName);


// export admin router
module.exports = router;
// import packages
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'excel/' });

// import auth file
const passport = require('passport')
require('../auth/auth')(passport)

// import admin controller
const adminController = require('../controllers/admin.controller');

// test route
router.get('/', passport.authenticate('jwt', { session: false }), adminController.test);

// register admin
router.post('/register', adminController.registerAdmin);

// login admin
router.post('/login', adminController.loginAdmin);

// update admin info
router.post('/update/info', passport.authenticate('jwt', { session: false }), adminController.updateAdminInfo);

// change password
router.post('/update/password', passport.authenticate('jwt', { session: false }), adminController.changeAdminPassword);

// get admin by id
// router.get('/info/:id', adminController.getAdminById);

// get all admins
// router.get('/list', adminController.getAllAdmins);

// add student
router.post('/add-student', adminController.addStudent);

// add student using excel file
router.post('/add-student/excel', upload.single('file'), adminController.addStudentUsingExcel);

// delete student
router.post('/delete-student', adminController.deleteStudent);

// get student details
router.get('/student-info/:id', passport.authenticate('jwt', { session: false }), adminController.getStudentDetails);

// get students list
router.get('/students/list', adminController.getStudentsList);

// add teacher
router.post('/add-teacher', passport.authenticate('jwt', { session: false }), adminController.addTeacher);

// add teacher using excel file
router.post('/add-teacher/excel', upload.single('file'), adminController.addTeacherUsingExcel);

// delete teacher
router.post('/delete-teacher', adminController.deleteTeacher);

// get teacher details
router.get('/teacher-info/:id', passport.authenticate('jwt', { session: false }), adminController.getTeacherDetails);

// get teachers list
router.get('/teachers/list', adminController.getTeachersList);

// allocate student
router.post('/allocate-students/:teacherName', adminController.allocateStudents);

//unallocate student
router.post('/unallocate-student/:teacherName', adminController.unallocateStudents);

// get allocated students list
router.get('/allocated-students', adminController.getAllocatedStudentsList);

// get unallocated students list
router.get('/unallocated-students', adminController.getUnallocatedStudentsList);

// get allocated students list by teacher name
router.get('/allocated-students/:teacherName', adminController.getAllocatedStudentsListByTeacherName);


// export admin router
module.exports = router;
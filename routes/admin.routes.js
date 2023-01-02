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

// auth route
router.get('/', passport.authenticate('jwt', { session: false }), adminController.auth);

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
router.post('/add-student', passport.authenticate('jwt', { session: false }), adminController.addStudent);

// add student using excel file
router.post('/add-student/excel', passport.authenticate('jwt', { session: false }), upload.single('file'), adminController.addStudentUsingExcel);

// delete student
router.post('/delete-student', passport.authenticate('jwt', { session: false }), adminController.deleteStudent);

// get student details
router.get('/student-info/:studentName', passport.authenticate('jwt', { session: false }), adminController.getStudentDetails);

// get students list
router.get('/students/list', passport.authenticate('jwt', { session: false }), adminController.getStudentsList);

// add teacher
router.post('/add-teacher', passport.authenticate('jwt', { session: false }), adminController.addTeacher);

// add teacher using excel file
router.post('/add-teacher/excel', passport.authenticate('jwt', { session: false }), upload.single('file'), adminController.addTeacherUsingExcel);

// delete teacher
router.post('/delete-teacher', passport.authenticate('jwt', { session: false }), adminController.deleteTeacher);

// get teacher details
router.get('/teacher-info/:id', passport.authenticate('jwt', { session: false }), adminController.getTeacherDetails);

// get teachers list
router.get('/teachers/list', passport.authenticate('jwt', { session: false }), adminController.getTeachersList);

// allocate student
router.post('/allocate-students/:teacherName', passport.authenticate('jwt', { session: false }), adminController.allocateStudents);

//unallocate student
router.post('/unallocate-student/:teacherName', passport.authenticate('jwt', { session: false }), adminController.unallocateStudents);

// get allocated students list
router.get('/allocated-students', passport.authenticate('jwt', { session: false }), adminController.getAllocatedStudentsList);

// get unallocated students list
router.get('/unallocated-students', passport.authenticate('jwt', { session: false }), adminController.getUnallocatedStudentsList);

// get allocated students list by teacher name
router.get('/allocated-students/:teacherName', passport.authenticate('jwt', { session: false }), adminController.getAllocatedStudentsListByTeacherName);


// export admin router
module.exports = router;
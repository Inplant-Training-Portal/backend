// admin router
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'excel/' });

// import admin controller
const adminController = require('../controllers/admin.controller.js');

// test route
router.get('/test', adminController.test);

// register admin
router.post('/register', adminController.registerAdmin);

// login admin
router.post('/login', adminController.loginAdmin);

// update admin info
router.post('/update/info/:id', adminController.updateAdminInfo);

// change password
router.post('/update/password/:id', adminController.changeAdminPassword);

// get admin by id
// router.get('/info/:id', adminController.getAdminById);

// get students documents
router.get('/students/:id/documents', adminController.getStudentDocuments);

// get all admins
router.get('/list', adminController.getAllAdmins);

// add student
router.post('/add-student', adminController.addStudent);

// add student using excel file
router.post('/add-student/excel', upload.single('file'), adminController.addStudentUsingExcel);

// delete student
router.post('/delete-student', adminController.deleteStudent);

// get student details
router.get('/student-info/:id', adminController.getStudentDetails);

// get students list
router.get('/students/list', adminController.getStudentsList);

// add teacher
router.post('/add-teacher', adminController.addTeacher);

// delete teacher
router.post('/delete-teacher', adminController.deleteTeacher);

// get teacher details
router.get('/teacher-info/:id', adminController.getTeacherDetails);

// get teachers list
router.get('/teachers/list', adminController.getTeachersList);

// allocate single student
router.post('/allocate-single-student/:teacherName/:studentId',adminController.allocateSingleStudent);

// deallocate single student 
router.post('/deallocate-single-student',adminController.deallocateSingleStudent);

// allocate student
router.post('/allocate-student/:studentId/:teacherName', adminController.allocateStudent);

//unallocate student
router.post('/unallocate-student/:studentId', adminController.unallocateStudent);

// get allocated students list
router.get('/allocated-students', adminController.getAllocatedStudentsList);

// get unallocated students list
router.get('/unallocated-students', adminController.getUnallocatedStudentsList);

// get allocated teachers list
router.get('/allocated-teachers', adminController.getAllocatedTeachersList);

// get unallocated teachers list
router.get('/unallocated-teachers', adminController.getUnallocatedTeachersList);

// get allocated students list by teacher name
router.get('/allocated-student/:teacherName', adminController.getAllocatedStudentsListByTeacherName);


// export admin router
module.exports = router;
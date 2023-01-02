// import packages
const express = require('express');
const router = express.Router();

// import auth file
const passport = require('passport')
require('../auth/auth')(passport)

// import teacher controller
const teacherController = require('../controllers/teacher.controller');

// auth route
router.get('/', passport.authenticate('jwt', { session: false }), teacherController.auth);

// login teacher
router.post('/login', teacherController.loginTeacher);

// login teacher
router.post('/login', teacherController.loginTeacher);

// update teacher profile
router.post('/update/info', passport.authenticate('jwt', { session: false }), teacherController.updateTeacherInfo);

// change password
router.post('/update/password', passport.authenticate('jwt', { session: false }), teacherController.changeTeacherPassword);

// get student details
router.get('/student-info/:studentName', passport.authenticate('jwt', { session: false }), teacherController.getStudentDetails);

// get all students
router.get('/students/list', passport.authenticate('jwt', { session: false }), teacherController.getStudentsList);

// get allocated students list
router.get('/allocated-students', passport.authenticate('jwt', { session: false }), teacherController.getAllocatedStudentsList);

// send email
router.post('/send-email', passport.authenticate('jwt', { session: false }), teacherController.sendMail);

// send bulk email
router.post('/send-bulk-email', passport.authenticate('jwt', { session: false }), teacherController.sendBulkMail);

// send details
router.get('/send-details/:studentName', teacherController.sendDetails);

// get and upload industry marks
router.post('/upload-industry-marks/:studentName', teacherController.uploadIndustryMarks);

// get and upload faculty marks
router.post('/upload-faculty-marks/:studentName', passport.authenticate('jwt', { session: false }), teacherController.uploadFacultyMarks);

// map document
router.get('/file/map', passport.authenticate('jwt', { session: false }), teacherController.mapFile);

// delete document
router.post('/file/delete', passport.authenticate('jwt', { session: false }), teacherController.deleteFile);


// export router
module.exports = router;
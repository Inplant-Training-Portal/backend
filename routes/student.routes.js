// student router
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const passport = require('passport')

// import auth file
require('../auth/student.auth')(passport)

// import student controller
const studentController = require('../controllers/student.controller');

// login student
router.post('/login', studentController.loginStudent);

// update student profile
router.post('/update/info', passport.authenticate('jwt', { session: false }), studentController.updateStudentInfo);

// change password
router.post('/update/password', passport.authenticate('jwt', { session: false }), studentController.changeStudentPassword);

// get teacher profile
// router.get('/teacher/:id', studentController.getTeacherProfile);

// upload document
router.post("/file/upload", passport.authenticate('jwt', { session: false }), upload.single('file'), studentController.uploadFile);

// map document
router.get("/file/map", passport.authenticate('jwt', { session: false }), studentController.mapFile);


// export router
module.exports = router;

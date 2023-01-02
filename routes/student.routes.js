// student router
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// import auth file
const passport = require('passport')
require('../auth/auth')(passport)

// import student controller
const studentController = require('../controllers/student.controller');

// auth route
router.get('/', passport.authenticate('jwt', { session: false }), studentController.auth);

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

// delete document
router.post("/file/delete", passport.authenticate('jwt', { session: false }), studentController.deleteFile);

// export router
module.exports = router;

// import the student model
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');

// import packages
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const multer = require('multer');

const secret = "secretkey"

const upload = multer({ dest: 'uploads/' });

// login
const loginStudent = (req, res) => {
    const { enrollment_no, password } = req.body;
    Student.findOne({ enrollment_no }, function (err, student) {
        if (err) {
            res.status(500).json({
                error: err
            });
        }
        if (student) {
            // compare password
            bcrypt.compare(password, student.password, function (err, result) {
                if (err) {
                    res.status(401).json({
                        message: 'Login failed! Please try again.'
                    });
                }
                if (result) {
                    // generate token
                    let token = jwt.sign({ username: student._id }, secret, { expiresIn: '1h' });
                    res.status(200).json({
                        message: 'Login successful!',
                        token,
                        user: student
                    });
                } 
                else {
                    res.status(401).json({
                        message: 'Password does not match!'
                    });
                }
            });
        } else {
            res.status(401).json({
                message: 'Oops, Student not found!'
            });
        }
    });
}

// update student info
const updateStudentInfo = (req, res) => {
    const id = req.params.id;

    let newInfo = {};

    if(req.body.email){
        newInfo.email = req.body.email;

    }

    if(req.body.mobile_no) {
        newInfo.mobile_no = req.body.mobile_no;
    }

    Student.findByIdAndUpdate(id, newInfo, { new: true })
        .then(function (result) {
            res.status(200).json({
                message: 'Info updated successfully!',
                result
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// change password
const changeStudentPassword = (req, res) => {
    const id = req.params.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // check if old password is correct
    if(oldPassword) {
        Student.findById(id)
            .then(function (student) {
                if (student) {
                    // compare password
                    bcrypt.compare(oldPassword, student.password, function (err, result) {
                        if (err) {
                            res.status(401).json({
                                message: 'Login failed! Please try again.'
                            });
                        }
                        if (result) {
                            // check if new password and confirm password match
                            if(newPassword === confirmPassword) {
                                // encrypt password
                                bcrypt.hash(newPassword, 10, function (err, hash) {
                                    if (err) {
                                        res.json({
                                            error: err
                                        })
                                    }
                                    Student.findByIdAndUpdate(id, { password: hash }, { new: true })
                                        .then(function (result) {
                                            res.status(200).json({
                                                message: 'Password updated successfully!',
                                                result
                                            });
                                        })
                                        .catch(function (err) {
                                            res.status(500).json({
                                                error: err
                                            });
                                        });
                                });
                            } else {
                                res.status(401).json({
                                    message: 'New password and Confirm password do not match!'
                                });
                            }
                        }
                        else {
                            res.status(401).json({
                                message: 'Old password does not match!'
                            });
                        }
                    });
                } else {
                    res.status(401).json({
                        message: 'Oops, Student not found!'
                    });
                }
            }
            )
            .catch(function (err) {
                res.status(500).json({
                    error: err
                });
            }
            );
    }
}

// get student profile
const getStudentProfile = async (req, res) => {
    try {
// check if header has authorization
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, 'randomString');
            const student = await Student.findById(decoded.student.id);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.status(200).json(student);
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (e) {
        res.send({ message: 'Error in Fetching student' });
    }
}

// get student profile
const getTeacherProfile = async (req, res) => {
    try {
        // request student is _id of student
        const teacher = await Teacher.findById(req.teacher.id);
        res.json(teacher);
    } catch (e) {
        res.send({ message: 'Error in Fetching teacher' });
    }
}

// upload file to google drive
const uploadFile = async (req, res) => {
    try {
        const student = await Student.findById(req.student.id);
        const file = req.file;
        const fileObj = {
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            path: file.path
        };
        student.files.push(fileObj);
        await student.save();
        res.status(200).json({ message: 'File uploaded successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error in uploading file' });
    }
}




// view file
const viewFile = async (req, res) => {
    try {
        const student = await Student.findById(req.student
            .id);
        const file = student.files.id(req.params.id);
        res.json(file);
    } catch (err) {
        res.status(500).json({ message: 'Error in fetching file' });
    }
}

// download file
const downloadFile = async (req, res) => {
    try {
        const student = await Student.findById(req.student
            .id);
        const file = student.files.id(req.params.id);
        res.download(file.fileLink);
    } catch (err) {
        res.status(500).json({ message: 'Error in downloading file' });
    }
}


module.exports={
    loginStudent,
    updateStudentInfo,
    changeStudentPassword,
    getStudentProfile,
    getTeacherProfile,
    uploadFile,
    viewFile,
    downloadFile
}
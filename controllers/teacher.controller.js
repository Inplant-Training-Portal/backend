// import the student model
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');

// import packages
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secret = "secretkey"

// login teacher
const loginTeacher = (req, res) => {
    const { username, password } = req.body;
    Teacher.findOne({ username }, function (err, teacher) {
        if (err) {
            res.status(500).json({
                error: err
            });
        }
        if (teacher) {
            // compare password
            bcrypt.compare(password, teacher.password, function (err, result) {
                if (err) {
                    res.status(401).json({
                        message: 'Login failed! Please try again.'
                    });
                }
                if (result) {
                    // generate token
                    let token = jwt.sign({ username: teacher._id }, secret, { expiresIn: '1h' });
                    res.status(200).json({
                        message: 'Login successful!',
                        token,
                        user: teacher
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
                message: 'Oops, Teacher not found!'
            });
        }
    });
}

// update teacher info
const updateTeacherInfo = (req, res) => {
    const id = req.params.id;

    // update password
    if(req.body.password){
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            if (err) {
                res.json({
                    error: err
                })
            }
            const newPassword = {
                password: hash
            };
            Teacher.findByIdAndUpdate(id, { password: newPassword.password }, { new: true })
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
    }

    //update email
    if(req.body.email){
        const newEmail = {
            email: req.body.email
        };
        Teacher.findByIdAndUpdate(id, { email: newEmail.email }, { new: true })
            .then(function (result) {
                res.status(200).json({
                    message: 'Email updated successfully!',
                    result
                });
            })
            .catch(function (err) {
                res.status(500).json({
                    error: err
                });
            });
    }

    // update mobile no
    if(req.body.mobile_no){
        const newMobileNo = {
            mobile_no: req.body.mobile_no
        };
        Teacher.findByIdAndUpdate(id, { mobile_no: newMobileNo.mobile_no }, { new: true })
            .then(function (result) {
                res.status(200).json({
                    message: 'Mobile Number updated successfully!',
                    result
                });
            })
            .catch(function (err) {
                res.status(500).json({
                    error: err
                });
            });
    }
}

// student info
const getStudentProfile = async (req, res) => {
    try {
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

const getTeacherProfile = async (req, res) => {
    try {
        // request student is _id of student
        const teacher = await Teacher.findById(req.teacher.id);
        res.json(teacher);
    } catch (e) {
        res.send({ message: 'Error in Fetching teacher' });
    }
}

// view file
const viewFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        res.json(file);
    } catch (e) {
        res.send({ message: 'Error in Fetching file' });
    }
}

// download file
const downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        res.download(file.path);
    } catch (e) {
        res.send({ message: 'Error in Fetching file' });
    }
}

const updateTeacherProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (teacher) {
            teacher.email = req.body.email 
            teacher.mobile_no = req.body.mobile_no

            const updatedTeacher = await teacher.save();
            res.json(updatedTeacher);
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    } catch (e) {
        res.send({ message: 'Error in Updating teacher' });
    }
}


module.exports={
    loginTeacher,
    updateTeacherInfo,
    getStudentProfile,
    getTeacherProfile,
    viewFile,
    downloadFile,
    updateTeacherProfile
}
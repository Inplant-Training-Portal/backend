// import packages
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');

// import the student model
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');


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
                else {
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

    let newInfo = {};

    if(req.body.email){
        newInfo.email = req.body.email;

    }

    if(req.body.mobile_no) {
        newInfo.mobile_no = req.body.mobile_no;
    }

    Teacher.findByIdAndUpdate(id, newInfo, { new: true })
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
const changeTeacherPassword = (req, res) => {
    const id = req.params.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // check if old password is correct
    if(oldPassword) {
        Teacher.findById(id)
            .then(function (teacher) {
                if (teacher) {
                    // compare password
                    bcrypt.compare(oldPassword, teacher.password, function (err, result) {
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
                                    Teacher.findByIdAndUpdate(id, { password: hash }, { new: true })
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
                        message: 'Oops, Teacher not found!'
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

// get student list
const getStudentsList = (req, res) => {
    Student.find({}, function (err, students) {
        if (err) {
            res.status(500).json({
                message: 'Oops, something went wrong!',
                error: err
            });
        }
        res.status(200).json({
            students
        });
    }
    );
}

const getAllocatedStudentsListByTeacherName = (req, res) => {
    const teacherName = req.params.teacherName;
    Teacher.findOne({ name: teacherName })
        .then(function (teacher) {
            Student.find({ mentor: teacher._id })
                .then(function (students) {
                    res.status(200).json({
                        students
                    });
                })
                .catch(function (err) {
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
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

// send mail
const sendMail = (req, res) => {
    const { email, subject, message } = req.body;
    const mailOptions = {
        from: '',
        to: email,
        subject: subject,
        text: message
    };
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            res.status(500).json({
                message: 'Oops, something went wrong!',
                error: err
            });
        } else {
            res.status(200).json({
                message: 'Email sent successfully!'
            });
        }
    });
}



module.exports={
    loginTeacher,
    updateTeacherInfo,
    changeTeacherPassword,
    getStudentsList,
    getAllocatedStudentsListByTeacherName,
    getStudentProfile,
    getTeacherProfile,
    viewFile,
    downloadFile,
    updateTeacherProfile,
    sendMail
}
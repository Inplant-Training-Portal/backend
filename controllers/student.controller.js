// import the student model
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');

// import packages
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secret = "secretkey"

// login
const loginStudent = (req, res) => {
    const { username, password } = req.body;
    Student.findOne({ username }, function (err, student) {
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
            Student.findByIdAndUpdate(id, { password: newPassword.password }, { new: true })
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
        Student.findByIdAndUpdate(id, { email: newEmail.email }, { new: true })
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
        Student.findByIdAndUpdate(id, { mobile_no: newMobileNo.mobile_no }, { new: true })
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

// upload file
const uploadFile = async (req, res) => {
    try {
        const { file } = req;
        const { title, description } = req.body;
        const student = await Student.findById(req.student
            .id);
        const newFile = {
            title,
            description,
            fileLink: file.path,
            size: file.size,
            key: file.filename,
            owner: student._id,
        };
        student.files.push(newFile);
        await student.save();
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: 'Error in saving file' });
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
    getStudentProfile,
    getTeacherProfile,
    uploadFile,
    viewFile,
    downloadFile
}
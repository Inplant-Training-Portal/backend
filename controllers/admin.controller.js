// admin model
const Admin = require('../models/admin.model');
const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secret = 'secretkey';

// test route
const test = (req, res) => {
    res.send('working...');
}

// register admin
const registerAdmin = (req, res) => {
    const { name, email, password } = req.body;
    const admin = new Admin({
        name,
        email,
        password
    });
    admin.save()
        .then(function (result) {
            res.status(201).json({
                message: 'Admin created successfully!',
                result
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// login admin
const loginAdmin = (req, res) => {
    const { username, password } = req.body;
    Admin.findOne({ username: username })
        .then(function (admin) {
            if (admin) {
                bcrypt.compare(password, admin.password, function (err, result) {
                    if (err) {
                        return res.status(401).json({
                            failed: 'Unauthorized Access'
                        });
                    }
                    if (result) {
                        const JWTToken = jwt.sign({
                            _id: admin._id
                        },
                            secret, {
                            expiresIn: '2h'
                        }
                        );
                        // set token in cookie
                        return res.status(200).json({
                            success: 'JWT Auth',
                            token: JWTToken
                        }).cookie('token', JWTToken, { expire: new Date() + 9999 });;
                    }
                    return res.status(401).json({
                        failed: 'Unauthorized Access'
                    });
                });
            } else {
                return res.status(401).json({
                    failed: 'Unauthorized Access'
                });
            }
        })
        .catch(function (error) {
            res.status(500).json({
                error: error
            });
        });
}

// get all admins
const getAllAdmins = (req, res) => {
    Admin.find()
        .then(function (admins) {
            res.status(200).json({
                admins
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// get admin by id
const getAdminById = (req, res) => {
    const id = req.params.id;
    Admin.findById(id)
        .then(function (admin) {
            res.status(200).json({
                admin
            });
        }
        )
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        }
        );
}

// delete admin
const deleteAdmin = (req, res) => {
    const id = req.params.id;
    Admin.findByIdAndDelete(id)
        .then(function () {
            res.status(200).json({
                message: 'Admin deleted successfully!'
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// get students list
const getStudentsList = (req, res) => {
    Student.find()
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
}

// get teachers list
const getTeachersList = (req, res) => {
    Teacher.find()
        .then(function (teachers) {
            res.status(200).json({
                teachers
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

const addStudent = (req, res) => {
    const { name, enrollment_no, password } = req.body;
    const student = new Student({
        name,
        enrollment_no,
        password
    });
    student.save()
        .then(function (result) {
            res.status(201).json({
                message: 'Student created successfully!',
                result
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

const addTeacher = (req, res) => {
    const { name, username, password } = req.body;
    const teacher = new Teacher({
        name,
        username,
        password
    });
    teacher.save()
        .then(function (result) {
            res.status(201).json({
                message: 'Teacher created successfully!',
                result
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

const deleteStudent = (req, res) => {
    const id = req.params.id;
    Student.findByIdAndDelete(id)
        .then(function () {
            res.status(200).json({
                message: 'Student deleted successfully!'
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

const deleteTeacher = (req, res) => {
    const id = req.params.id;
    Teacher.findByIdAndDelete(id)
        .then(function () {
            res.status(200).json({
                message: 'Teacher deleted successfully!'
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// allocate student's id to teacher
const allocateStudent = (req, res) => {
    // get student id and teacher name from params
    const studentId = req.params.studentId;
    const teacherName = req.params.teacherName;
    // find teacher by name
    Teacher.findOne({ name: teacherName })
        .then(function (teacher) {
            // find student by id
            Student.findById(studentId)
                .then(function (student) {
                    // update student's teacher id
                    student.mentor = teacher._id;
                    student.save()
                        // if student's teacher id updated successfully then add students id to teacher schema
                        .then(function (result) {
                            res.status(200).json({
                                message: 'Teacher allocated successfully!',
                                result
                            });
                            teacher.students.push(student._id);
                            teacher.save()
                                .then(function (result) {
                                    res.status(200).json({
                                        message: 'Student allocated successfully!',
                                        result
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
                })
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        })
}

// get allowcated students list
const getAllocatedStudentsList = (req, res) => {
    Student.find({ mentor: { $ne: null } })
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
}

// get allowcated teachers list
const getAllocatedTeachersList = (req, res) => {
    Teacher.find({ students: { $ne: null } })
        .then(function (teachers) {
            res.status(200).json({
                teachers
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// get unallocated students list
const getUnallocatedStudentsList = (req, res) => {
    Student.find({ mentor: null })
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
}

// get unallocated teachers list
const getUnallocatedTeachersList = (req, res) => {
    Teacher.find({ students: null })
        .then(function (teachers) {
            res.status(200).json({
                teachers
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// get student's details
const getStudentDetails = (req, res) => {
    const id = req.params.id;
    Student.findById(id)
        .then(function (student) {
            res.status(200).json({
                student
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// get teacher's details
const getTeacherDetails = (req, res) => {
    const id = req.params.id;
    Teacher.findById(id)
        .then(function (teacher) {
            res.status(200).json({
                teacher
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}

// update student's details
const updateStudentDetails = (req, res) => {
    const id = req.params.id;
    const { email , mobile_no } = req.body;
    Student.findById(id)
        .then(function (student) {
            student.email = email;
            student.mobile_no = mobile_no;
            student.save()
                .then(function (result) {
                    res.status(200).json({
                        message: 'Student updated successfully!',
                        result
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

// get allocated students list by teacher name
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

export default {
    test,
    registerAdmin,
    loginAdmin,
    getAllAdmins,
    getAdminById,
    addStudent,
    addTeacher,
    deleteAdmin,
    getStudentsList,
    getTeachersList,
    deleteStudent,
    deleteTeacher,
    allocateStudent,
    getAllocatedStudentsList,
    getAllocatedTeachersList,
    getUnallocatedStudentsList,
    getUnallocatedTeachersList,
    getStudentDetails,
    getTeacherDetails,
    updateStudentDetails,
    getAllocatedStudentsListByTeacherName
}
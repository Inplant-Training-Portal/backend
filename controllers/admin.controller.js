const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// admin model
const Admin = require('../models/Admin.model');
const Teacher = require('../models/Teacher.model');
const Student = require('../models/Student.model');

// import middleware
const auth = require('../middlewares/admin');

const secret = 'secretkey';

// test route
const test = (req, res) => {
    res.send('working...');
}

// Admin Functions

// register admin
const registerAdmin = (req, res) => {
    const { name, username, password } = req.body;

    // check if admin already exists
    Admin.findOne({ username: username })
        .then(function (adminData) {
            if (adminData) {
                res.status(400).json({ message: 'Admin already exists' });
            } else {


                // encrypt password
                bcrypt.hash(password, 10, function (err, hash) {
                    if (err) {
                        res.json({
                            error: err
                        })
                    }
                    const admin = new Admin({
                        name,
                        username,
                        password: hash
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
                });
            }
        })
}

// login admin
const loginAdmin = (req, res, auth) => {
    const { username, password } = req.body;
    Admin.findOne({ username }, function (err, admin) {
        if (err) {
            res.status(500).json({
                error: err
            });
        }
        if (admin) {
            // compare password
            bcrypt.compare(password, admin.password, function (err, result) {
                if (err) {
                    res.status(401).json({
                        message: 'Login failed! Please try again.'
                    });
                }
                if (result) {
                    // generate token
                    let token = jwt.sign({ username: admin._id }, secret, { expiresIn: '1h' });
                    res.status(200).json({
                        message: 'Login successful!',
                        token,
                        userid: admin._id
                    });
                } else {
                    res.status(401).json({
                        message: 'Password does not match!'
                    });
                }
            });
        } else {
            res.status(401).json({
                message: 'Oops, Admin not found!'
            });
        }
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

// get all admins
const getAllAdmins = (req, res) => {
    // list all admins
    Admin.find({}, function (err, admins) {
        if (err) {
            res.status(500).json({
                message: 'Oops, something went wrong!',
                error: err
            });
        }
        res.status(200).json({
            admins
        });
    });
}

// Student Functions

// add student
const addStudent = ( req, res) => {
    const { name, enrollment_no, password } = req.body;
    // hash password using bcrypt
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            res.json({
                error: err
            })
        }
        else {
            const student = new Student({
                name,
                enrollment_no,
                password: hash
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
    });
}

// delete student
const deleteStudent = (req, res) => {
    const id = req.params.id;
    Student.findByIdAndDelete(id)
        // check if student exists
        .then(function (student) {
            if (!student) {
                res.status(404).json({
                    message: 'Student not found!'
                });
            }
            res.status(200).json({
                message: 'Student deleted successfully!'
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

// get students list
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

// Teacher Functions

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

// delete teacher
const deleteTeacher = (req, res) => {
    const id = req.params.id;
    Teacher.findByIdAndDelete(id)
        .then(function (teacher) {
            if (!teacher) {
                res.status(404).json({
                    message: 'Teacher not found!'
                });
            }
            res.status(200).json({
                message: 'Teacher deleted successfully!'
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

// Allocate Functions

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

// Unused Functions

// // update student's details
// const updateStudentDetails = (req, res) => {
//     const id = req.params.id;
//     const { email , mobile_no } = req.body;
//     Student.findById(id)
//         .then(function (student) {
//             student.email = email;
//             student.mobile_no = mobile_no;
//             student.save()
//                 .then(function (result) {
//                     res.status(200).json({
//                         message: 'Student updated successfully!',
//                         result
//                     });
//                 })
//                 .catch(function (err) {
//                     res.status(500).json({
//                         error: err
//                     });
//                 });
//         })
//         .catch(function (err) {
//             res.status(500).json({
//                 error: err
//             });
//         });
// }

// // delete admin
// const deleteAdmin = (req, res) => {
//     const id = req.params.id;
//     Admin.findByIdAndDelete(id)
//         .then(function () {
//             res.status(200).json({
//                 message: 'Admin deleted successfully!'
//             });
//         })
//         .catch(function (err) {
//             res.status(500).json({
//                 error: err
//             });
//         });
// }

module.exports = {
    test,
    registerAdmin,
    loginAdmin,
    getAdminById,
    getAllAdmins,
    addStudent,
    deleteStudent,
    getStudentDetails,
    getStudentsList,
    addTeacher,
    deleteTeacher,
    getTeacherDetails,
    getTeachersList,
    allocateStudent,
    getAllocatedStudentsList,
    getUnallocatedStudentsList,
    getAllocatedTeachersList,
    getUnallocatedTeachersList,
    getAllocatedStudentsListByTeacherName
}
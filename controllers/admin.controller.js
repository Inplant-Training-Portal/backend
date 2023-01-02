// import env variables
require('dotenv').config()

//import packages
const bcrypt = require('bcrypt');
const importExcel = require('convert-excel-to-json');
const fs = require('fs');
const jwt = require('jsonwebtoken');


// import models
const Admin = require('../models/Admin.model');
const Teacher = require('../models/Teacher.model');
const Student = require('../models/Student.model');
const File = require('../models/File.model')

// saltRounds for encrypting password
const saltRounds = 12


// Admin Functions

// auth 
const auth = async (req, res) => {

    try {
        res.status(200).json({
            message: "Authorized"
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// register admin
const registerAdmin = async (req, res) => {
    
    try {
        const { name, username, password, email, mobile_no } = req.body;
        let admin = await Admin.findOne({ username: username })
        if(!admin) {
            // encrypt password
            bcrypt.hash(password, saltRounds, async function(err, hashedPassword) {
                if(err) {
                    res.status(500).json({
                        error: err,
                        message: "Something went wrong"
                    })
                }
                let newAdmin = await Admin.create({
                    name: name,
                    username: username,
                    password: hashedPassword,
                    email: email,
                    mobile_no: mobile_no
                })
                
                res.status(201).json({
                    message: "Admin created successfully"
                })
            })
        }
        else {
            res.status(400).json({
                message: "Admin already exists"
            })
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            error: err
        })
    }
}

// login admin
const loginAdmin = async (req, res) => {
    
    try {
        const { username, password } = req.body;
        let admin = await Admin.findOne({ username: username })
        if(!admin) {
            res.status(404).json({
                message: "Oops, No Admin Found!"
            })
        }
        else {
            // compare passport
            bcrypt.compare(password, admin.password, function(err, result) {
                if(err) {
                    res.status(500).json({
                        message: "Something went wrong"
                    })
                }
                if(result) {
                    const payload = { id: admin._id, whoami: "admin"}

                    jwt.sign(
                        payload,
                        process.env.SECRETORKEY,
                        { expiresIn: '1h' },
                        (err, token) => {
                            res.status(202).json({
                                message: "Login Successful!",
                                token: token,
                                user: {
                                    id: admin._id,
                                    name: admin.name,
                                    username: admin.username,
                                    email: admin.email,
                                    mobile_no: admin.mobile_no
                                }
                            })
                        }
                    )
                }
                else {
                    res.status(401).json({
                        message: "Incorrect Credentials"
                    })
                }
            })
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            error: err,
            message: "Something went wrong"
        })
    }
}

// get admin by id
const getAdminById = async (req, res) => {
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

// update admin info
const updateAdminInfo = async (req, res) => {
    
    try {
        const id = req.user.id;
        let newInfo = {};

        if(req.body.email) {
            newInfo.email = req.body.email;
        }

        if(req.body.mobile_no) {
            newInfo.mobile_no = req.body.mobile_no
        }

        await Admin.findByIdAndUpdate(id, newInfo, { new: true })

        const admin = await Admin.findById(id, { password: 0 })

        res.status(200).json({
            message: "Info update successfully!",
            user: admin
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            error: err,
            message: "Something went wrong"
        })
    }
}

// change password
const changeAdminPassword = async (req, res) => {
    
    try {
        const id = req.user.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        let admin = await Admin.findById(id)
        bcrypt.compare(oldPassword, admin.password, function (err, result) {
            if(err) {
                res.status(401).json({
                    message: "Something went wrong"
                })
            }
            if(result) {
                if(newPassword === confirmPassword) {
                    // encrypt password
                    bcrypt.hash(newPassword, saltRounds, function(err, hashedPassword) {
                        if(err) {
                            res.status(500).json({
                                message: "Something went wrong"
                            })
                        }
                        if(result) {
                            admin.password = hashedPassword
                            admin.save()
                            res.status(202).json({
                                password: admin.password,
                                message: "Password changed successfully"
                            })
                        }
                    })
                }
                else {
                    res.status(400).json({
                        message: "New password and Confirm password do not match!"
                    })
                }
            }
            else {
                res.status(400).json({
                    message: "Old password doesn't match"
                })
            }
        })

    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}


// Student Functions

// add student
const addStudent = async (req, res) => {
    console.log(req.body);
    
    try {
        const { name, enrollment_no, password, mobile_no, email, organization_name, organization_mentor_name, organization_mentor_email } = req.body;
        let student = await Student.findOne({ enrollment_no: enrollment_no })
        if(student) {
            res.status(400).json({
                message: "Student already exists with same Enrollment No"
            })
        }
        else {
            bcrypt.hash(password, saltRounds, async function(err, hashedPassword) {
                const newStudent = await Student.create({
                    name: name,
                    enrollment_no: enrollment_no,
                    password: hashedPassword,
                    email: email,
                    mobile_no: mobile_no,
                    "organization_mentor.name": organization_name,
                    "organization_mentor.mentor_name": organization_mentor_name,
                    "organization_mentor.mentor_email": organization_mentor_email
                })

                res.status(201).json({
                    message: "Student created successfully!"
                })
            })
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            error: err,
            message: "Something went wrong"
        })
    }
}

// add student using excel sheet
const addStudentUsingExcel = async (req, res) => {

    try {
        const file = req.file;
        const path = file.path;

        let data = importExcel({
            sourceFile: file.path,
            header: {
                rows: 1
            },
            columnToKey: {
                A: "name",
                B: "enrollment_no",
                C: "password",
                D: "email",
                E: "mobile_no",
                F: "organization_name",
                G: "organization_mentor_name",
                H: "organization_mentor_email"
            },
            sheets: ["Sheet1"]
        });

        fs.unlink(path, function(err) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            }
        });

        data.Sheet1.forEach(async function(studentData) {
            console.log(studentData);
            let student = await Student.findOne({ enrollment_no: studentData.enrollment_no })
            if(!student) {
                bcrypt.hash(studentData.password, saltRounds, async function(err, hashedPassword) {
                    const newStudent = await Student.create({
                        name: studentData.name,
                        enrollment_no: studentData.enrollment_no,
                        password: hashedPassword,
                        email: studentData.email,
                        mobile_no: studentData.mobile_no,
                        "organization_mentor.name": studentData.organization_name,
                        "organization_mentor.mentor_name": studentData.organization_mentor_name,
                        "organization_mentor.mentor_email": studentData.organization_mentor_email
                    });
                });
            }
        });

        res.status(201).json({
            message: "Student added successfully"
        });

    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            error: err,
            message: "Something went wrong"
        })
    }
}

// delete student
const deleteStudent = async (req, res) => {

    try {
        const { enrollment_no } = req.body;

        let student = await Student.findOne({ enrollment_no: enrollment_no })
        if(!student) {
            res.status(404).json({
                message: "Student not found"
            });
        }
        else {
            await Student.findByIdAndDelete(student._id)
            res.status(200).json({
                message: "Student deleted successfully"
            })
        }

    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            error: err,
            message: "Something went wrong"
        })
    }
}

// get student's details
const getStudentDetails = async (req, res) => {

    try {
        const studentName = req.params.studentName;
        let student = await Student.findOne({ name: studentName }, { password: 0 })
        let documents = await File.findOne({ student_id: student.id })

        if(!documents) {
            res.status(200).json({
                student: {
                    id: student._id,
                    name: student.name,
                    enrollment_no: student.enrollment_no,
                    email: student.email,
                    mobile_no: student.mobile_no,
                    faculty_mentor_name: student.faculty_mentor.name,
                    faculty_mentor_email: student.faculty_mentor.email,
                    faculty_mentor_mobile_no: student.faculty_mentor.mobile_no,
                    organization_name: student.organization_mentor.name,
                    organization_mentor_name: student.organization_mentor.mentor_name,
                    organization_mentor_email: student.organization_mentor.mentor_email,
                }
            })
        }
        else {
            res.status(200).json({
                student: {
                    id: student._id,
                    name: student.name,
                    enrollment_no: student.enrollment_no,
                    email: student.email,
                    mobile_no: student.mobile_no,
                    faculty_mentor_name: student.faculty_mentor.name,
                    faculty_mentor_email: student.faculty_mentor.email,
                    faculty_mentor_mobile_no: student.faculty_mentor.mobile_no,
                    organization_name: student.organization_mentor.name,
                    organization_mentor_name: student.organization_mentor.mentor_name,
                    organization_mentor_email: student.organization_mentor.mentor_email,
                },
                documents
            })
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// get students list
const getStudentsList = async (req, res) => {

    try {
        let students = await Student.find({}, { password: 0 })

        res.status(200).json({
            students
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}


// Teacher Functions

// add teacher
const addTeacher = async (req, res) => {
    
    try {
        const { name, username, password, email, mobile_no } = req.body;
        let teacher = await Teacher.findOne({ username: username })
        if(teacher) {
            res.status(400).json({
                message: "Teacher already exists with same Username"
            })
        }
        else {
            bcrypt.hash(password, saltRounds, async function(err, hashedPassword) {
                const newTeacher = await Teacher.create({
                    name: name,
                    username: username,
                    password: hashedPassword,
                    email: email,
                    mobile_no: mobile_no
                })

                res.status(201).json({
                    message: "Teacher created successfully!"
                })
            })
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// add teacher using excel sheet
const addTeacherUsingExcel = async (req, res) => {

    try {
        const file = req.file;
        const path = file.path;

        let data = importExcel({
            sourceFile: file.path,
            header: {
                rows: 1
            },
            columnToKey: {
                A: "name",
                B: "username",
                C: "password",
                D: "email",
                E: "mobile_no"
            },
            sheets: ["Sheet1"]
        });

        fs.unlink(path, function(err) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            }
        });
        console.log(data);

        data.Sheet1.forEach(async function(teacherData) {
            let teacher = await Teacher.findOne({ username: teacherData.username })
            if(!teacher) {
                bcrypt.hash(teacherData.password, saltRounds, async function(err, hashedPassword) {
                    const newTeacher = await Teacher.create({
                        name: teacherData.name,
                        username: teacherData.username,
                        password: hashedPassword,
                        email: teacherData.email,
                        mobile_no: teacherData.mobile_no
                    });
                });
            }
        });

        res.status(201).json({
            message: "Teacher added successfully"
        });

    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// delete student
const deleteTeacher = async (req, res) => {

    try {
        const { username } = req.body;

        let teacher = await Teacher.findOne({ username: username })
        if(!teacher) {
            res.status(404).json({
                message: "Teacher not found"
            });
        }
        else {
            await Teacher.findByIdAndDelete(teacher._id)
            res.status(200).json({
                message: "Teacher deleted successfully"
            })
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// get student's details
const getTeacherDetails = async (req, res) => {

    try {
        const id = req.params.id;
        let teacher = await Teacher.findById(id)

        res.status(200).json({
            teacher: {
                name: teacher.name,
                enrollment_no: teacher.username,
                email: teacher.email,
                mobile_no: teacher.mobile_no
            }
        });
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// get students list
const getTeachersList = async (req, res) => {

    try {
        let teachers = await Teacher.find({}, { password: 0 })

        res.status(200).json({
            teachers
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}


// Allocate Functions

// allocate students
const allocateStudents = async (req, res) => {
    // console.log(req.body, req.params)

    try {
        const teacherName = req.params.teacherName
        const students = req.body

        let teacher = await Teacher.findOne({ name: teacherName })

        for (let i = 0; i < students.length; i++) {
            let student = await Student.findById(students[i])
            student.faculty_mentor.name = teacher.name
            student.faculty_mentor.email = teacher.email
            student.faculty_mentor.mobile_no = teacher.mobile_no
            student.save()

            teacher.students.push(student._id)
        }
        teacher.save()
        
        res.status(202).json({
            message: "Mentor allocated successfully"
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// unallocate students
const unallocateStudents = async (req, res) => {

    try {
        const teacherName = req.params.teacherName
        const students = req.body

        let teacher = await Teacher.findOne({ name: teacherName })

        for (let i = 0; i < students.length; i++) {
            // let student = await Student.findById(students[i])
            // student.faculty_mentor = null
            // student.save()
            await Student.findByIdAndUpdate(students[i], { $unset: { faculty_mentor: "" } })

            teacher.students.pop(students[i])
        }
        teacher.save()
        
        res.status(202).json({
            message: "Mentor unallocated successfully"
        })

    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// get allowcated students list
const getAllocatedStudentsList = async (req, res) => {

    try {
        let students = await Student.find({ faculty_mentor: { $ne: null } }, { password: 0 })

        res.status(200).json({
            students
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// get unallocated students list
const getUnallocatedStudentsList = async (req, res) => {

    try {
        let students = await Student.find({ faculty_mentor: null }, { password: 0 })

        res.status(200).json({
            students
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// get allocated students list by teacher name
const getAllocatedStudentsListByTeacherName = async (req, res) => {

    try {
        const teacherName = req.params.teacherName

        let students = await Student.find({ "faculty_mentor.name": teacherName }, { password: 0 })

        res.status(200).json({
            students
        })

    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

module.exports = {
    auth,
    registerAdmin,
    loginAdmin,
    getAdminById,
    getAllAdmins,
    updateAdminInfo,
    changeAdminPassword,
    addStudent,
    addStudentUsingExcel,
    deleteStudent,
    getStudentDetails,
    getStudentsList,
    addTeacher,
    addTeacherUsingExcel,
    deleteTeacher,
    getTeacherDetails,
    getTeachersList,
    allocateStudents,
    unallocateStudents,
    getAllocatedStudentsList,
    getUnallocatedStudentsList,
    getAllocatedStudentsListByTeacherName
}
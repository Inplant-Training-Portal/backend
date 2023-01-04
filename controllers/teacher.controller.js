// import .env variables
require('dotenv').config();

// import packages
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
var { google } = require('googleapis');
const keys = require('../inplant-training-portal-369403-dec6828816c4.json')

// import models
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const IndustryMarks = require('../models/IndustryMarks.model');
const FacultyMarks = require('../models/FacultyMarks.model');
const File = require('../models/File.model')

// saltRounds to encrypt password
const saltRounds = 12


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


// login teacher
const loginTeacher = async (req, res) => {
    
    try {
        const { username, password } = req.body;
        let teacher = await Teacher.findOne({ username: username })
        if(!teacher) {
            res.status(404).json({
                message: "Oops, No Teacher Found!"
            })
        }
        else {
            // compare passport
            bcrypt.compare(password, teacher.password, function(err, result) {
                if(err) {
                    res.status(500).json({
                        message: "Something went wrong"
                    })
                }
                if(result) {
                    const payload = { id: teacher._id, whoami: "teacher"}

                    jwt.sign(
                        payload,
                        process.env.SECRETORKEY,
                        { expiresIn: '1h' },
                        (err, token) => {
                            res.status(202).json({
                                message: "Login Successful!",
                                token: token,
                                user: {
                                    id: teacher._id,
                                    name: teacher.name,
                                    username: teacher.username,
                                    email: teacher.email,
                                    mobile_no: teacher.mobile_no
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

// update teacher info
const updateTeacherInfo = async (req, res) => {
    
    try {
        const id = req.user.id;
        let newInfo = {};

        if(req.body.email) {
            newInfo.email = req.body.email;
        }

        if(req.body.mobile_no) {
            newInfo.mobile_no = req.body.mobile_no
        }

        await Teacher.findByIdAndUpdate(id, newInfo, { new: true })

        const teacher = await Teacher.findById(id, { password: 0 })

        res.status(200).json({
            message: "Info update successfully!",
            user: teacher
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
const changeTeacherPassword = async (req, res) => {
    
    try {
        const id = req.user.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        let teacher = await Teacher.findById(id)
        bcrypt.compare(oldPassword, teacher.password, function (err, result) {
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
                            teacher.password = hashedPassword
                            teacher.save()
                            res.status(202).json({
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

const getAllocatedStudentsList = async (req, res) => {

    try {
        const id = req.user.id

        let teacher = await Teacher.findById(id)
        let students = await Student.find({ "faculty_mentor.name": teacher.name}, { password: 0 })

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

// send mail
const sendMail = async (req, res) => {

    try {
        const id = req.user.id
        console.log(req.body);
        const { studentName } = req.body
        const query = `?name=${studentName}`
        const link = `${req.headers.origin}/ask-assessment/${query}`

        const teacher = await Teacher.findById(id, { password: 0 })

        const student = await Student.findOne({ name: studentName }, { password: 0 })


        // setup transporter
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWORD
            },
            port: 587,
            host: 'smtp.gmail.com'
        });

        console.log("Transporter is ready to send mail");

        // setup email data
        const mailOptions = {
            from: process.env.EMAIL,
            to: student.organization_mentor.mentor_email,
            subject: "Ask for Marks Evaluation",
            text: "Dear Sir/Madam, I am " + teacher.name + 
            " from the Department of Computer Engineering, Government Polytechnic Mumbai. I would like to ask you to evaluate the marks of my student " + 
            student.name + 
            " . Google Form link for the same is attached below Thank you.\n\n" + 
            link
        };

        console.log("Mail Drafted");

        // send mail
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    message: 'Oops, something went wrong!',
                    error: err
                });
            } else {
                console.log("Mail Sent " + info.response);
                res.status(200).json({
                    message: 'Mail sent successfully!'
                });
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

// send bulk email
const sendBulkMail = async (req, res) => {

    try {
        console.log(req.body)
        const id = req.user.id
        const data = req.body

        const teacher = await Teacher.findById(id, { password: 0 })

        data.forEach(async element => {
            const query = `?name=${element}`
            const link = `${req.headers.origin}/ask-assessment/${query}`
            const student = await Student.findOne({ name: element }, { password: 0 })

            // setup transporter
            const transporter = nodeMailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASSWORD
                },
                port: 587,
                host: 'smtp.gmail.com'
            });
    
            console.log("Transporter is ready to send mail");
    
            // setup email data
            const mailOptions = {
                from: process.env.EMAIL,
                to: student.organization_mentor.mentor_email,
                subject: "Ask for Marks Evaluation",
                text: "Dear Sir/Madam, I am " + teacher.name + 
                " from the Department of Computer Engineering, Government Polytechnic Mumbai. I would like to ask you to evaluate the marks of my student " + 
                student.name + 
                " . Google Form link for the same is attached below Thank you.\n\n" + 
                link
            };
    
            console.log("Mail Drafted");
    
            // send mail
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Mail Sent " + info.response);
                }
            });
        });

        res.status(200).json({
            message: 'Mail sent successfully!'
        });
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// send details
const sendDetails = async (req, res) => {

    try {
        const studentName = req.params.studentName;

        const student = await Student.findOne({ name: studentName }, { password: 0 })

        if(student) {
            res.status(200).json({
                student
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

// get and upload industry marks
const uploadIndustryMarks = async (req, res) => {
    
    try {
        const studentName = req.params.studentName
        const { month, discipline, attitude, maintenance, report, achievement } = req.body;

        const student = await Student.findOne({ name: studentName }, { password: 0 })

        if(!student) {
            res.status(404).json({
                message: "Something went wrong"
            })
        }
        else {
            const marksData = {
                month: month,
                discipline: discipline,
                attitude: attitude,
                maintenance: maintenance,
                report: report,
                achievement: achievement
            }
            const marks = await IndustryMarks.findOne({ student_id: student._id })

            if(!marks) {
                const newMarks = await IndustryMarks.create({
                    student_id: student._id
                })

                newMarks.marks.push(marksData)
                newMarks.save()

                student.industry_marks = newMarks._id
                student.save()
            }
            else {
                marks.marks.push(marksData)
                marks.save()
            }

            // create client
            const client = new google.auth.JWT(
                keys.client_email,
                null,
                keys.private_key,
                ['https://www.googleapis.com/auth/spreadsheets']
            );

            // authorize client
            client.authorize(function(err, tokens) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    console.log('Connected!');
                    gsrun(client);
                }
            });

            async function gsrun(cl) {
                const gsapi = google.sheets({ version: 'v4', auth: cl });

                await gsapi.spreadsheets.values.append({
                    spreadsheetId: '1DbOUPg4Glor3oZszDejcEc_gPmb9UZ72Kdpig6ykaLc',
                    range: 'Industry_Marks!A:H',
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [
                            [month, student.enrollment_no, student.name, discipline, attitude, maintenance, report, achievement]
                        ]
                    }

                })

                res.status(200).json({
                    message: "Marks uploaded successfully"
                })
            }
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// get and upload faculty marks
const uploadFacultyMarks = async (req, res) => {
    
    try {
        const studentName = req.params.studentName
        const { month, discipline, attitude, maintenance, report, achievement } = req.body;

        const student = await Student.findOne({ name: studentName }, { password: 0 })

        if(!student) {
            res.status(404).json({
                message: "Something went wrong"
            })
        }
        else {
            const marksData = {
                month: month,
                discipline: discipline,
                attitude: attitude,
                maintenance: maintenance,
                report: report,
                achievement: achievement
            }
            const marks = await FacultyMarks.findOne({ student_id: student._id })

            if(!marks) {
                const newMarks = await FacultyMarks.create({
                    student_id: student._id
                })

                newMarks.marks.push(marksData)
                newMarks.save()

                student.faculty_marks = newMarks._id
                student.save()
            }
            else {
                marks.marks.push(marksData)
                marks.save()
            }

            // create client
            const client = new google.auth.JWT(
                keys.client_email,
                null,
                keys.private_key,
                ['https://www.googleapis.com/auth/spreadsheets']
            );

            // authorize client
            client.authorize(function(err, tokens) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    console.log('Connected!');
                    gsrun(client);
                }
            });

            async function gsrun(cl) {
                const gsapi = google.sheets({ version: 'v4', auth: cl });
            
                await gsapi.spreadsheets.values.append({
                    spreadsheetId: '1DbOUPg4Glor3oZszDejcEc_gPmb9UZ72Kdpig6ykaLc',
                    range: 'Faculty_Marks!A:H',
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [
                            [month, student.enrollment_no, student.name, discipline, attitude, maintenance, report, achievement]
                        ]
                    }

                })

                res.status(200).json({
                    message: "Marks uploaded successfully"
                })
            }
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// map file
const mapFile = async (req, res) => {

    try {
        const { id } = req.body

        let documents = await File.find({ student_id: id })

        res.status(200).json({
            documents
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

// delete file
const deleteFile = async (req, res) => {

    try {
        const { fileId } = req.body
        console.log(fileId);

        const client = new google.auth.JWT(
            keys.client_email,
            null,
            keys.private_key,
            ['https://www.googleapis.com/auth/drive']
        );
        
        client.authorize(async function(err, tokens) {
            if(err) {
                console.log(err);
                return;
            }
            else {
                console.log('Connected to Drive API');
                await gdrun(client);
            }
        });
        
        async function gdrun(cl) {
            const gdapi = google.drive({ version: 'v3', auth: cl });

            const deleteFile = async (req, res) => {
                await gdapi.files.delete({
                    fileId: fileId,
                })
            }

            await deleteFile()
            console.log("Deleted file from Drive");
        }

        const file = await File.findOne({ "files.fileId": fileId })
        
        file.files.forEach(element => {
            if(element.fileId == fileId) {
                console.log(element);
                file.files.remove(element)
                file.save()
            }
        });

        res.status(200).json({
            message: "File Deleted Successfully"
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}


module.exports={
    auth,
    loginTeacher,
    updateTeacherInfo,
    changeTeacherPassword,
    getStudentDetails,
    getStudentsList,
    getAllocatedStudentsList,
    sendMail,
    sendDetails,
    uploadIndustryMarks,
    uploadFacultyMarks,
    sendBulkMail,
    mapFile,
    deleteFile
}
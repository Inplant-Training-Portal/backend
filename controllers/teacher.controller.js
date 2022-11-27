// import packages
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const excelJS = require('exceljs');
var { google } = require('googleapis');
const keys = require('../inplant-training-portal-369403-dec6828816c4.json')

// import the student model
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const Marks = require('../models/Marks.model');

// import .env variables
require('dotenv').config();

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
            Student.find({ faculty_mentor: teacher._id })
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

    const { name, faculty_mentor_name, organization_mentor_email } = req.body;
    const query = `?name=${name}`
    const link = `${req.headers.origin}/ask-assessment/${query}`

    // setup transporter
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            // take from .env file
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
        port: 587,
        host: 'smtp.gmail.com'
    });

    console.log("Transporter is ready to send mail");

    // setup email data
    const mailOptions = {
        from: process.env.EMAIL,
        to: organization_mentor_email,
        subject: "Ask for Marks Evaluation",
        text: "Dear Sir/Madam, I am " + faculty_mentor_name + 
        " from the Department of Computer Engineering, Government Polytechnic Mumbai. I would like to ask you to evaluate the marks of my student " + 
        name + 
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

// send details
const sendDetails = (req, res) => {
    const query = req.params.studentName;
    const studentName = query.split('=')[1];

    Student
        .findOne
        ({
            name: studentName
        })
        .then(function (student) {
            res.status(200).json({
                student
            });
        })
        .catch(function (err) {
            res.status(500).json({
                error: err,
                message: 'Oops, something went wrong!'
            });
        });
}

// get and upload industry marks
const uploadIndustryMarks = (req, res) => {
    const studentName = req.params.studentName;
    const { discipline, attitude, maintenance, report, achievement } = req.body;

    Student.findOne({name: studentName})
        .then(function (student) {
            // create marks
            const marks = new Marks({
                student: student._id,
                discipline,
                attitude,
                maintenance,
                report,
                achievement
            });
            marks.save()

            // push marks to student
            student.industry_marks.push(marks._id);
            student.save()

            // save marks in excel file
            const fileName = "./excel/marks.xlsx";
            const workbook = new excelJS.Workbook();
            
            workbook.xlsx.readFile(fileName)
            .then(() => {
                const worksheet = workbook.getWorksheet(1);
                const lastRow = worksheet.lastRow;
                const getRowInsert = worksheet.getRow(++(lastRow.number));
                getRowInsert.getCell(1).value = student.enrollment_no;
                getRowInsert.getCell(2).value = studentName;
                getRowInsert.getCell(3).value = discipline;
                getRowInsert.getCell(4).value = attitude;
                getRowInsert.getCell(5).value = maintenance;
                getRowInsert.getCell(6).value = report;
                getRowInsert.getCell(7).value = achievement;
                getRowInsert.commit();
                workbook.xlsx.writeFile(fileName);
            });

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
            
                const wb = new excelJS.Workbook();
                let excelFile = await wb.xlsx.readFile('./excel/marks.xlsx')
                
                // get data from Sheet1
                let sheet = excelFile.getWorksheet('Industry_Marks');
                let data = sheet.getSheetValues();
            
                // discard 1 empty item from each row
                data = data.map(function(r) {
                    return [r[1],r[2],r[3],r[4],r[5],r[6],r[7]];
                });
            
                // discard sheet 1 empty item
                data.shift();
                // console.log(data1);
                
                //update function
                const update = {
                    spreadsheetId: '1DbOUPg4Glor3oZszDejcEc_gPmb9UZ72Kdpig6ykaLc',
                    range: 'Industry_Marks!A1',
                    valueInputOption: 'USER_ENTERED',
                    resource: { values: data }
                };
            
                let res = await gsapi.spreadsheets.values.update(update);
            }

            res.status(200).json({
                message: 'Marks uploaded successfully!'
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).json({
                error: err,
                message: 'Oops, something went wrong!'
            });
        });
}

// get and upload faculty marks
const uploadFacultyMarks = (req, res) => {
    const studentName = req.params.studentName;
    const { discipline, attitude, maintenance, report, achievement } = req.body;

    Student.findOne({name: studentName})
        .then(function (student) {
            // create marks
            const marks = new Marks({
                student: student._id,
                discipline,
                attitude,
                maintenance,
                report,
                achievement
            });
            marks.save()

            // update student
            student.faculty_marks.push(marks._id);
            student.save()

            // save marks in excel file
            const fileName = "./excel/marks.xlsx";
            const workbook = new excelJS.Workbook();
            
            workbook.xlsx.readFile(fileName)
            .then(() => {
                const worksheet = workbook.getWorksheet(2);
                const lastRow = worksheet.lastRow;
                const getRowInsert = worksheet.getRow(++(lastRow.number));
                getRowInsert.getCell(1).value = student.enrollment_no;
                getRowInsert.getCell(2).value = studentName;
                getRowInsert.getCell(3).value = discipline;
                getRowInsert.getCell(4).value = attitude;
                getRowInsert.getCell(5).value = maintenance;
                getRowInsert.getCell(6).value = report;
                getRowInsert.getCell(7).value = achievement;
                getRowInsert.commit();
                workbook.xlsx.writeFile(fileName);
            });

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
            
                const wb = new excelJS.Workbook();
                let excelFile = await wb.xlsx.readFile('./excel/marks.xlsx')
                
                // get data from Sheet1
                let sheet = excelFile.getWorksheet('Faculty_Marks');
                let data = sheet.getSheetValues();
            
                // discard 1 empty item from each row
                data = data.map(function(r) {
                    return [r[1],r[2],r[3],r[4],r[5],r[6],r[7]];
                });
            
                // discard sheet 1 empty item
                data.shift();
                // console.log(data1);
                
                //update function
                const update = {
                    spreadsheetId: '1DbOUPg4Glor3oZszDejcEc_gPmb9UZ72Kdpig6ykaLc',
                    range: 'Faculty_Marks!A1',
                    valueInputOption: 'USER_ENTERED',
                    resource: { values: data }
                };
            
                let res = await gsapi.spreadsheets.values.update(update);
            }

            res.status(200).json({
                message: 'Marks uploaded successfully!'
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).json({
                error: err,
                message: 'Oops, something went wrong!'
            });
        });
}

// send bulk email
const sendBulkMail = (req, res) => {

    ifError = false;

    // loop number of students
    for (let i = 0; i < req.body.length; i++) {
        const name = req.body[i][0];
        const faculty_mentor_name = req.body[i][1];
        const organization_mentor_email = req.body[i][2];

        const query = `?name=${name}`
        const link = `${req.headers.origin}/ask-assessment/${query}`

        // setup transporter
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            },
            port: 587,
            host: 'smtp.gmail.com',
        });

        console.log("Transporter is ready to send mail");

        // setup email data
        const mailOptions = {
            from: process.env.EMAIL,
            to: organization_mentor_email,
            subject: "Ask for Marks Evaluation",
            text: "Dear Sir/Madam, I am " + faculty_mentor_name + 
            " from the Department of Computer Engineering, Government Polytechnic Mumbai. I would like to ask you to evaluate the marks of my student " + 
            name + 
            " . Google Form link for the same is attached below Thank you.\n\n" + 
            link
        };

        console.log("Mail Drafted");

        // send mail
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                ifError = true;
                console.log(err);
            } else {
                console.log("Mail Sent " + info.response);
            }
        });
    }
    if (ifError) {
        res.status(500).json({
            message: 'Oops, something went wrong!'
        });
    }
    else {
        res.status(200).json({
            message: 'Mail sent successfully!'
        });
    }
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
    sendMail,
    sendDetails,
    uploadIndustryMarks,
    uploadFacultyMarks,
    sendBulkMail
}
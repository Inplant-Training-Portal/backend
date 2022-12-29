// import .env variables
require('dotenv').config();

// import packages
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const excelJS = require('exceljs');
var { google } = require('googleapis');
const keys = require('../inplant-training-portal-369403-dec6828816c4.json')

// import models
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const Marks = require('../models/Marks.model');
const File = require('../models/File.model')

// saltRounds to encrypt password
const saltRounds = 12


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
                                token: "Bearer " + token,
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

        res.status(200).json({
            message: "Info update successfully!"
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
        const id = req.params.id;
        let student = await Student.findById(id, { password: 0 })

        res.status(200).json({
            student
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
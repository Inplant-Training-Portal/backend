// import packages
const bcrypt = require('bcrypt');
const { google } = require('googleapis');
const keys = require('../inplant-training-portal-369403-dec6828816c4.json');
const fs = require('fs');
const jwt = require('jsonwebtoken')


// import models
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const File = require('../models/File.model');

// saltRounds for encrypting password
const saltRounds = 12


// login student
const loginStudent = async (req, res) => {
    
    try {
        const { enrollment_no, password } = req.body;
        let student = await Student.findOne({ enrollment_no: enrollment_no })
        if(!student) {
            res.status(404).json({
                message: "Oops, No Student Found!"
            })
        }
        else {
            // compare password
            bcrypt.compare(password, student.password, function(err, result) {
                if(result) {
                    const payload = { id: student._id, enrollment_no: student.enrollment_no, name: student.name, email: student.email, mobile_no: enrollment_no.mobile_no }

                    // sign jwt to get token
                    jwt.sign(
                        payload,
                        process.env.SECRETORKEY,
                        { expiresIn: '1h' },
                        (err, token) => {
                            res.status(202).json({
                                message: "Login Successful!",
                                token: "Bearer " + token,
                                user: payload
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

// update student info
const updateStudentInfo = async (req, res) => {
    
    try {
        const id = req.user.id;
        let newInfo = {};

        if(req.body.email) {
            newInfo.email = req.body.email;
        }

        if(req.body.mobile_no) {
            newInfo.mobile_no = req.body.mobile_no
        }

        await Student.findByIdAndUpdate(id, newInfo, { new: true })

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
const changeStudentPassword = async (req, res) => {
    
    try {
        const id = req.user.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        
        let student = await Student.findById(id)

        // compare password
        bcrypt.compare(oldPassword, student.password, function (err, result) {
            if(result) {
                if(newPassword === confirmPassword) {
                    // encrypt password
                    bcrypt.hash(newPassword, saltRounds, function(err, hashedPassword) {
                        if(result) {
                            student.password = hashedPassword
                            student.save()

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
                res.status(401).json({
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

// // get student profile
// const getTeacherProfile = async (req, res) => {
//     try {
//         // request student is _id of student
//         const teacher = await Teacher.findById(req.teacher.id);
//         res.json(teacher);
//     } catch (e) {
//         res.send({ message: 'Error in Fetching teacher' });
//     }
// }

// upload file
const uploadFile = async (req, res) => {

    try {
        const id = req.user.id;
        const { originalname, mimeType, path } = req.file;

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
    
            const fileMetadata = {
                'name': originalname,
                'parents': ['1F3GpRYV4cme9EGaXwV50grTnWfEhyM5M']
            };
    
            const media = {
                mimeType: mimeType,
                body: fs.createReadStream(path)
            };
    
            const file = await gdapi.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
            });

            console.log("File uploaded to Google Drive");

            let student = await Student.findById(id)

            const fileData = await File.create({
                student_id: student._id,
                name: originalname,
                url : `https://drive.google.com/file/d/${file.data.id}`
            });

            student.documents.push(fileData._id)
            student.save()
            
            fs.unlink(path, (err) => {
                if(err) {
                    console.log(err);
                }
                else {
                    console.log('Local file deleted');
                }
            });
    
            res.status(201).json({
                message: 'File uploaded successfully!'
            });
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
        const id = req.user.id

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


module.exports={
    loginStudent,
    updateStudentInfo,
    changeStudentPassword,
    // getTeacherProfile,
    uploadFile,
    mapFile
}
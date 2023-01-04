// import packages
const bcrypt = require('bcrypt');
const { google } = require('googleapis');
const keys = require('../inplant-training-portal-369403-dec6828816c4.json');
const fs = require('fs');
const jwt = require('jsonwebtoken')


// import models
const Student = require('../models/Student.model');
const File = require('../models/File.model');

// saltRounds for encrypting password
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

// login student
const loginStudent = async (req, res) => {
    
    try {
        const { username, password } = req.body;
        let student = await Student.findOne({ enrollment_no: username })
        if(!student) {
            res.status(404).json({
                message: "Oops, No Student Found!"
            })
        }
        else {
            // compare password
            bcrypt.compare(password, student.password, function(err, result) {
                if(result) {
                    const payload = { id: student._id, whoami: "student"}

                    // sign jwt to get token
                    jwt.sign(
                        payload,
                        process.env.SECRETORKEY,
                        { expiresIn: '1h' },
                        (err, token) => {
                            res.status(202).json({
                                message: "Login Successful!",
                                token: token,
                                user: {
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

        const student = await Student.findById(id, { password: 0 })

        res.status(200).json({
            message: "Info update successfully!",
            user: student
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

            const files = await File.findOne({ student_id: student._id })

            const fileData = {
                name: originalname,
                fileId: file.data.id,
                url : `https://drive.google.com/file/d/${file.data.id}`
            }

            if(!files) {
                const newFile = await File.create({
                    student_id: student._id
                })

                newFile.files.push(fileData)
                newFile.save()

                student.documents.push(newFile._id)
                student.save()
            }
            else {
                files.files.push(fileData)
                files.save()
            }
            
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

        let documents = await File.findOne({ student_id: id })
        if(!documents) {
            res.status(200).json({
                success: true
            })
        }
        else {
            res.status(200).json({
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

// delete file
const deleteFile = async (req, res) => {

    try {
        const { fileId } = req.body

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
    loginStudent,
    updateStudentInfo,
    changeStudentPassword,
    uploadFile,
    mapFile,
    deleteFile
}
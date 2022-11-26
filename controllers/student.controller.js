const { google } = require('googleapis');
const keys = require('../inplant-training-portal-369403-dec6828816c4.json');
const fs = require('fs');

// import the student model
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const File = require('../models/File.model');

// import packages
const bcrypt = require('bcrypt');

// login
const loginStudent = (req, res) => {
    const { enrollment_no, password } = req.body;
    Student.findOne({ enrollment_no }, function (err, student) {
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
                    res.status(200).json({
                        message: 'Login successful!',
                        user: student
                    });
                } else {
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

    let newInfo = {};

    if(req.body.email){
        newInfo.email = req.body.email;

    }

    if(req.body.mobile_no) {
        newInfo.mobile_no = req.body.mobile_no;
    }

    Student.findByIdAndUpdate(id, newInfo, { new: true })
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
const changeStudentPassword = (req, res) => {
    const id = req.params.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // check if old password is correct
    if(oldPassword) {
        Student.findById(id)
            .then(function (student) {
                if (student) {
                    // compare password
                    bcrypt.compare(oldPassword, student.password, function (err, result) {
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
                                    Student.findByIdAndUpdate(id, { password: hash }, { new: true })
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
                        message: 'Oops, Student not found!'
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
const uploadFile = (req, res) => {
    const student_id = req.params.id;
    const { originalname, mimeType, path } = req.file;

    const client = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.googleapis.com/auth/drive']
    );

    client.authorize(function(err, tokens) {
        if(err) {
            console.log(err);
            return;
        }
        else {
            console.log('Connected to Drive API');
            gdrun(client);
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

        
        Student.findById(student_id)
        .then(function (student) {
            if (student) {
                const fileData = new File({
                    student_id: student._id,
                    name: originalname,
                    url : `https://drive.google.com/file/d/${file.data.id}`
                });
                fileData.save()
                
                student.documents.push(fileData._id);
                student.save();
                
            }
        })
        
        fs.unlink(path, (err) => {
            if(err) {
                console.log(err);
            }
            else {
                console.log('File deleted');
            }
        });

        res.status(200).json({
            message: 'File uploaded successfully!'
        });
    }

    // call the function
    gdrun().then(() => {
        console.log('File uploaded successfully.');
    }
    ).catch((err) => {
        console.log(err);
    });
}

// map file
const mapFile = (req, res) => {
    const id = req.params.id

    // get students id from params and return all documents
    File.find({ student_id: id })
        .then(function (documents) {
            res.status(200).json({
                documents
            });
        }
        )
        .catch(function (err) {
            res.status(500).json({
                error: err
            });
        });
}


module.exports={
    loginStudent,
    updateStudentInfo,
    changeStudentPassword,
    getTeacherProfile,
    uploadFile,
    mapFile
}
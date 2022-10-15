// admin router
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// import admin model
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// import middleware
const auth = require('../middlewares/auth');
const verifyToken = require('../middlewares/verifyToken');

// test route
router.get('/', (req, res) => {
    res.send("This is admin route");
});

// get admin list
router.get('/list', (req, res) => {
    Admin.find({}, (err, admins) => {
        if (err) {
            console.log(err);
        } else {
            res.json(admins);
        }
    });
});

// register admin
router.post('/register', (req, res) => {    
    const newAdmin = new Admin({
        username:req.body.username,
        password : req.body.password,
    });
    newAdmin.save((err, admin) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Error registering admin' });
            return;
        }

        const token = jwt.sign({ id: admin._id }, 'secret', {
            expiresIn: 18000 // expires in 5 hours
        });

        res.status(200).send({id: admin._id, username: admin.username, auth: true, token: token });
    });
});


// login admin
router.post('/login', (req, res) => {

    // check for auth token
    const token = req.headers['auth-token'];
    if (token) {
        jwt.verify(token, 'secret', function (err, decoded) {
            if (err) {
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            }
            // if everything is good, save to request for use in other routes

            req.userId = decoded.id;
            res.status(200).send({ auth: true,id:decoded.id, message: 'Authenticated' });

        });
    } else {

    const username = req.body.username;

    Admin.findOne({ username: username }, (err, admin) => {
        if (err) {
            console.log(err);
        } else {
            if (admin) {
                if (admin.password === req.body.password) {
                    console.log(admin);
                    // create token and send to client
                    const token = jwt.sign({ id: admin._id }, 'secret', {
                        expiresIn: 18000 // expires in 5 hours
                    });
                    res.status(200).send({ auth: true,id:admin.id, token: token });
                    // res.header('auth-token', token).send(token);
                } else {
                    res.json({ message: 'Invalid password' });
                }
            } else {
                res.json({ message: 'Invalid username' });
            }
        }
    });
    }}
);

// get information in admin dashboard
router.get('/:id', (req, res) => {
    Admin.findById(req.params._id, (err, admin) => {
        if (err) {
            console.log(err);
        } else {
            res.json(admin);
        }
    });
});

// get students list
router.get('/students', (req, res) => {
    Student.find({}, (err, students) => {
        if (err) {
            console.log(err);
        } else {
            res.json(students);
        }
    });
});


// get teachers list
router.get('/teachers', (req, res) => {
    Teacher.find((err, teachers) => {
        if (err) {
            console.log(err);
        } else {
            res.json(teachers);
        }
    });
}
);

// add student
router.post('/add-student', (req, res) => {
    const student = new Student({
        name: req.body.name,
        enrollment_no: req.body.enrollment_no,
        password: req.body.password,
    });
    student.save((err, student) => {
        if (err) {
            console.log(err);
        } else {
            res.json(student);
        }
    }
    );
}
);

// add teacher
router.post('/add-teacher', (req, res) => {
    const teacher = new Teacher({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
    });
    teacher.save((err, teacher) => {
        if (err) {
            console.log(err);
        } else {
            res.json(teacher);
        }
    }
    );
}
);

// delete student
router.get('/delete-student/:id', (req, res) => {
    Student.findByIdAndRemove({ _id: req.params.id }, (err, student) => {
        if (err) {
            res.json(err);
        } else {
            res.json('Successfully removed');
        }
    });
}
);

// delete teacher
router.get('/delete-teacher/:id', (req, res) => {
    Teacher.findByIdAndRemove({ _id: req.params.id }, (err, teacher) => {
        if (err) {
            res.json(err);
        } else {
            res.json('Successfully removed');
        }
    });
}
);


// get password of student
router.get('/student/:enrollment_no', (req, res) => {
    Student.findOne({ enrollment_no: req.params.enrollment_no }, (err, student) => {
        if (err) {
            console.log(err);
        } else {
            res.json(student);
        }
    });
}
);

// get password of teacher
router.get('/teacher/:username', (req, res) => {
    Teacher.findOne({ username: req.params.username }, (err, teacher) => {
        if (err) {
            console.log(err);
        } else {
            res.json(teacher);
        }
    });
}
);


// allocate student's _id to teacher 
router.post('/allocate-student', (req, res) => {
    // take teacher's username and student's enrollment_no
    Teacher.findOne({ username: req.body.username }, (err, teacher) => {
        if (err) {
            console.log(err);
        } else {
            if (teacher) {
                Student.findOne({enrollment_no:req.body.enrollment_no}, (err, student) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (student) {
                            // add student's _id to teacher's students array
                            teacher.students.push(student._id);
                            teacher.save((err, teacher) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    res.json(teacher);
                                }
                            });
                            // set teacher's name as student's mentor
                            student.mentor=teacher.name;
                            student.save((err, student) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        } else {
                            res.json({ message: 'Invalid enrollment number' });
                        }
                    }
                });
            } else {
                res.json({ message: 'Invalid username' });
            }
        }
    });
}

);

// get students of teacher
router.get('/teacher-students/:username', (req, res) => {
    Teacher.findOne({ username: req.params.username }, (err, teacher) => {
        if (err) {
            console.log(err);
        } else {
            if (teacher) {
                res.json(teacher.students);
            } else {
                res.json({ message: 'Invalid username' });
            }
        }
    });
}
);


// export admin router
module.exports = router;
// admin router
const express = require('express');
const router = express.Router();

// import admin model
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// test route
router.get('/', (req, res) => {
    res.send("This is admin route");
});


// register admin
router.post('/register', (req, res) => {    
    const newAdmin = new Admin({
        username:req.body.username,
        password : req.body.password
    });
    newAdmin.save((err, admin) => {
        if (err) {
            console.log(err);
        } else {
            res.json(admin);
        }
    });
});


// login admin
router.post('/login', (req, res) => {
    const username = req.body.username;

    Admin.findOne({ username: username }, (err, admin) => {
        if (err) {
            console.log(err);
        } else {
            if (admin) {
                if (admin.password === req.body.password) {
                    res.json(admin);
                } else {
                    res.json({ message: 'Invalid password' });
                }
            } else {
                res.json({ message: 'Invalid username' });
            }
        }
    });
}
);


// get students list
router.get('/students', (req, res) => {
    Student.find((err, students) => {
        if (err) {
            console.log(err);
        } else {
            res.json(students);
        }
    });
}
);

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
router.post('/allocate-students', (req, res) => {
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
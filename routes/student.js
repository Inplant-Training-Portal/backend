const express = require('express');
const router = express.Router();

// import student model
const Student = require('../models/Student');

// test route
router.get('/', (req, res) => {
    res.send("This is student route");
});



// get student by id
router.get('/:id', (req, res) => {
    Student.findById(req.params.id, (err, student) => {
        if (err) {
            console.log(err);
        } else {
            res.json(student);
        }
    });
}
);

// login route
router.post('/login', (req, res) => {
    const enrollment_no = req.body.enrollment_no;

    Student.findOne({ enrollment_no: enrollment_no }, (err, student) => {
        if (err) {
            console.log(err);
        } else {
            if (student) {
                if (student.password === req.body.password) {
                    res.json(student);
                } else {
                    res.json({ message: 'Invalid password' });
                }
            } else {
                res.json({ message: 'Invalid enrollment number' });
            }
        }
    });
}
);

// update student
router.post('/update/:id', (req, res) => {
    Student.findById(req.params.id, (err, student) => {
        if (!student) {
            res.status(404).send('data is not found');
        } else {
            student.mobile_no = req.body.mobile;
            student.email = req.body.email;
            student.save().then(student => {
                res.json('Student updated');
            })
                .catch(err => {
                    res.status(400).send('Update not possible');
                });
        }
    });
}
);



// export router
module.exports = router;


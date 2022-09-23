
// import express
const express = require('express');
const router = express.Router();

// import teacher model
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// test route
router.get('/', (req, res) => {
    res.send("This is teacher route");
});


// get all students
router.get('/students', (req, res) => {
    Student.find({}, (err, students) => {
        if (err) {
               console.log(err);
            } else {
               res.json(students);
           }
      });
   }
);
        
// get students of teacher
router.get('/allocated-students/:username', (req, res) => {
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


// export router
module.exports = router;

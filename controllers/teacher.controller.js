// import the student model
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');

// import packages
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const teacher = await Teacher.findOne({ username:username });
        if (!teacher) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = {
            teacher: {
                id: teacher.id,
            },
        };
        jwt.sign(
            payload,
            'randomString',
            {
                expiresIn: 10000,
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ token });
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Error in Saving');
    }
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

export default {
    login,
    getStudentProfile,
    getTeacherProfile
}
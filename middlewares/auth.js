// create a jwt token
const jwt = require('jsonwebtoken');    

// import models schema
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// create a jwt token
function createToken(req,res,user) {
    const token = jwt.sign({ _id: user._id}, 'secretkey', {
        expiresIn: 18000 // expires in 5hours
    });

    res.header('auth-token', token).send(token);

}

// verify token
function verifyToken(req, res, next) {
    // check header or url parameters or post parameters for token
    const token = req.headers['auth-token'];
    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }

    // verifies secret and checks exp
    jwt.verify(token, 'secretkey', function (err, decoded) {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }
        // if everything is good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
}

// login admin
function loginAdmin(req, res) {
    const username = req.body.username;

    Admin.findOne({ username: username }, (err, admin) => {
        if (err) {
            console.log(err);
        } else {
            if (admin) {
                if (admin.password === req.body.password) {
                    const token = createToken(admin);
                    res.status(200).json({ auth: true, token: token });
                } else {
                    res.json({ message: 'Invalid password' });
                }
            } else {
                res.json({ message: 'Invalid username' });
            }
        }
    });
}

// login teacher
function loginTeacher(req, res) {
    const username = req.body.username;

    Teacher.findOne({ username: username }, (err, teacher) => {
        if (err) {
            console.log(err);
        } else {
            if (teacher) {
                if (teacher.password === req.body.password) {
                    const token = createToken(teacher);
                    res.status(200).json({ auth: true, token: token });
                } else {
                    res.json({ message: 'Invalid password' });
                }
            } else {
                res.json({ message: 'Invalid username' });
            }
        }
    });
}

// login student
function loginStudent(req, res) {
    const username = req.body.username;

    Student.findOne({ username: username }, (err, student) => {
        if (err) {
            console.log(err);
        } else {
            if (student) {
                if (student.password === req.body.password) {
                    const token = createToken(student);
                    res.status(200).json({ auth: true, token: token });
                } else {
                    res.json({ message: 'Invalid password' });
                }
            } else {
                res.json({ message: 'Invalid username' });
            }
        }
    });
}

// export functions
module.exports = {
    createToken,
    verifyToken,
    loginAdmin,
    loginTeacher,
    loginStudent
};

// dotenv config
require('dotenv').config();

// import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport')


// create express app
const app = express();

// initialize passport
app.use(passport.initialize())

// port number
const port = process.env.PORT || 9000;

// use cors middleware
app.use(cors());

// express static files
app.use(express.static('public'));

// use body-parser middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


// connect to mongodb
const mongouri =  `mongodb+srv://admin:${process.env.ATLAS_PASSWORD}@backend.l4ofsei.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(mongouri, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log('MongoDB database connection established successfully!');
    }
);


// import routes
const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');

// use routes
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', adminRoutes);


// test route
app.get('/', (req, res) => {
    res.send("testing");
});

// start server
app.listen(port, function() {
    console.log('Server is running on port: ' + port);
});

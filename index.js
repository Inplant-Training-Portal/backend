// dotenv config
require('dotenv').config();

// import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

// create express app
const app = express();

// port number
const port = process.env.PORT || 9000;

// use cors middleware
app.use(cors());

// use body-parser middleware
app.use(bodyParser.json());
// express static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// connect to mongodb
const mongouri =  "mongodb+srv://sample:sample@inplant-training.ohnrlch.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(mongouri, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log('MongoDB database connection established successfully!');
    }
);

// import routes
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
// const orgRoutes = require('./routes/org');

// use routes
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', adminRoutes);
// app.use('/org', orgRoutes);


// test route
app.get('/', (req, res) => {
    res.send("testing");
});

// start server
app.listen(port, function() {
    console.log('Server is running on port: ' + port);
});

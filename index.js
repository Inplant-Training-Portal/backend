// dotenv config
require('dotenv').config();

// import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 9000;

// use cors middleware
app.use(cors());
// use body-parser middleware
app.use(bodyParser.json());

// connect to mongodb
mongoose.connect("mongodb+srv://sample:sample@inplant-training.ohnrlch.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log('MongoDB database connection established successfully!');
    }
);

// import routes
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const adminRoutes = require('./routes/admin');

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
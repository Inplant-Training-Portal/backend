// import model
const Org = require('../models/Org.model');
const Student = require('../models/Student.model');

// test
const test = async (req, res) => {
    res.send('test');
}

// register
const register = async (req, res) => {
    try {
        const { userid, password, name, email, address, city, state, pincode, website } = req.body;
        const org = await Org.findOne({ email: email });
        if (org) {
            return res.status(400).json({ message: 'Organization already exists' });
        }
        const newOrg = new Org({
            userid,
            name,
            email,
            password,
            mobile_no,
            address,
            city,
            state,
            pincode,
            website
        });
        await newOrg.save();
        res.status(200).json({ message: 'Organization registered successfully' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Error in Saving');
    }
}

// login
const login = async (req, res) => {
    try {
        const { userid, password } = req.body;
        const org = await Org.findOne({ userid: userid });
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        const isMatch = await bcrypt.compare(password, org.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = {
            org: {
                id: org.id,
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
        res.status(500).send('Error : ' + err);
    }
}

// view file
const viewFile = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const file = student.documents;
        res.status(200).json({ file });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Error : ' + err);
    }
}

// export controller
module.exports = {
    test,
    register,
    login,
    viewFile
};
const express = require('express');
const jwt = require('jsonwebtoken');

const secret = "secret"

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, secret);
        const admin = await admin.findById(decoded.admin.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        else {
            res.status(200).json({userid: admin._id});
        }
        next();
    } catch (e) {
        res.send({ message: 'Error in Fetching admin' });
    }
}

module.exports = auth;
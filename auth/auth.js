require('dotenv').config()

// import passport jwt strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

// import admin model
const Admin = require('../models/Admin.model')
const Teacher = require('../models/Teacher.model')
const Student = require('../models/Student.model')

const adminOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRETORKEY
}

module.exports = passport => {
    passport.use(new JwtStrategy(adminOpts, async function(jwt_payload, done) {

        // check whether user is admin
        if(jwt_payload.whoami == "admin") {
            const user = await Admin.findById(jwt_payload.id)
            console.log(user);
            
            if(user) {
                return done(null, user)
            }
            else {
                return done(null, false)
            }
        }

        // check whether user is teacher
        if(jwt_payload.whoami == "teacher") {
            const user = await Teacher.findById(jwt_payload.id)
            console.log(user);
            
            if(user) {
                return done(null, user)
            }
            else {
                return done(null, false)
            }
        }

        // check whether user is student
        if(jwt_payload.whoami == "student") {
            const user = await Student.findById(jwt_payload.id)
            console.log(user);
            
            if(user) {
                return done(null, user)
            }
            else {
                return done(null, false)
            }
        }
    }))
}
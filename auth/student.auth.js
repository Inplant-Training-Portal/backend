require('dotenv').config()

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const Student = require('../models/Student.model')

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRETORKEY
}

module.exports = passport => {
    passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
        let user = await Student.findOne({ enrollment_no: jwt_payload.enrollment_no })
        if(user) {
            return done(null, user)
        }
        else {
            return done(null, false)
        }
    }))
}
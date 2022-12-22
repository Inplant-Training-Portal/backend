require('dotenv').config()

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const Admin = require('../models/Admin.model')

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRETORKEY
}

module.exports = passport => {
    passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
        let user = await Admin.findOne({ username: jwt_payload.username })
        if(user) {
            return done(null, user)
        }
        else {
            return done(null, false)
        }
    }))
}
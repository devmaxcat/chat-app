// there's probably libraries that do this for me but I decided to do it myself... (big mistake), maybe ill add oauth!????

const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const bcrypt = require("bcrypt")
const { User, ExposableFields } = require('./schemas/User')

exports.current = async (req, includeToken) => { // make this not async please
    const token = req.cookies.jwt
    if (token) {
        return await jwt.verify(token, jwtSecret, (err, decodedToken) => { 
            return decodedToken
        })
    }
}
exports.createsession = async (req, res, dbUser) => {
   
    let sessionData = { id: dbUser._id, username: dbUser.username} // Keep in mind, the username field is ONLY for reference it might be incorrect!

    exports.setsession(req, res, sessionData)

    const buffer = require('crypto').randomBytes(48)
    const token = buffer.toString('hex');
    const hash = token //await bcrypt.hash(token, 10)

    await User.updateOne({ _id: dbUser._id }, { long_session_identifier: hash })

    res.cookie("jwt-refresh", token, {
        httpOnly: false,
        path: '/',
        sameSite: 'none',
        secure: true
    });

    return sessionData

}


exports.refresh = async (req, res) => {
    let current = await exports.current(req)
    let refreshtoken = req.cookies['jwt-refresh']
    let sessionData;
    if (current) {
        console.log('client token extended')
        delete current.exp
        sessionData = current
        exports.setsession(req, res, current)
    } else if (refreshtoken) {
        console.log('attempting to consume refresh token... ')
        let hash = refreshtoken //await bcrypt.hash(refreshtoken, 10)
        let dbUser = await User.findOne({long_session_identifier: hash})
      
        if (dbUser) {
            console.log('user found with valid long-session identifier, issuing new token ')
          
            sessionData = await exports.createsession(req, res, dbUser)
        } else {
            console.log('no user found with long-session identifier ')
        }
     
    } else {
        let sessionData = await exports.current(req)
    }
    return sessionData
}

exports.setsession = (req, res, value) => {
    const maxAge = 3 * 60 * 60;
    // let ipprivate = JWTSecretNetworkHash(req)

    const token = jwt.sign(
        value,
        jwtSecret,
        {
            expiresIn: maxAge,
        }
    );

    res.cookie("jwt", token, {
        httpOnly: false,
        maxAge: maxAge * 1000,

        path: '/',
        sameSite: 'none',
        secure: true
    });
    // res.set({
    //     'authorization': token
    // })
    // redudandant maybe

}

exports.destroysession = (res) => {
    res.clearCookie('jwt')
    res.clearCookie('jwt-refresh')
}

// async function JWTSecretNetworkHash(req) {
//     //let hash = await bcrypt.hash(req.ip, 2)
//     //return jwtSecret + (hash)
//  }
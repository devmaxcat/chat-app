// there's probably libraries that do this for me but I decided to do it myself... (big mistake), maybe ill add oauth!????

const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const bcrypt = require("bcrypt")

exports.current = async (req) => {
   
    const token = req.cookies.jwt
    if (token) {
        return await jwt.verify(token, jwtSecret, (err, decodedToken) => {  
            return decodedToken 
        })
    }
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
}

// async function JWTSecretNetworkHash(req) {
//     //let hash = await bcrypt.hash(req.ip, 2)
//     //return jwtSecret + (hash)
//  }
const User = require("../../schemas/User")
const session = require('../../session')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET  
const bcrypt = require("bcrypt")

exports.authenticate = async (req, res, next) => { 
 
  if (await session.current(req)) {
    res.status(200)
    
  } else {
    return res.status(401).json({ message: "Not authorized" })
  }
}

exports.register = async (req, res, next) => { 
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "No username/password provided." })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" })
  }
   
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
    })
      .then((user) => {
        session.setsession(req, res,  { id: user._id, username, role: user.role })
        res.status(201).json({
          message: "User successfully created",
          user: user._id,
        });
      })
      .catch((error) =>
        res.status(400).json({
          message: "User not successful created",
          error: error.message,
        })
      );
  });
};

exports.logout = async (req, res, next) => {
  session.destroysession(res)
  res.status(200).json({
    message: "User logged out",
  });
}

exports.login = async (req, res, next) => {
  
  const { username, password } = req.body
  // Check if username and password is provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    })
  }
  try {
    const user = await User.findOne({ username })
    if (!user) {
      res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      })
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          session.setsession(req, res,  { id: user._id, username, role: user.role })
          res.status(200).json({
            message: "User successfully Logged in",
            user: user._id, 
          });
        } else {
          res.status(400).json({ message: "Login not succesful" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};
const {User, ExposableFields} = require("../../schemas/User")

const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET  
const bcrypt = require("bcrypt")
const { Mongoose } = require("mongoose")

exports.self = async (req, res, next) => {
 
  let sessionData = req.session?.user
  if (!sessionData) {
    res.status(401).json({
      message: 'User is not logged in',
      error: 'Unauthorized'
    })
    return
  }
  let user = await User.findById(sessionData.id)
  if (!user) {
    res.status(401).json({
      message: 'Session token invalid',
      error: 'Unauthorized'
    })
    return
  }
  // while information IS stored in the cookie, that information can be outdated.
  // The id field is the only cookie field which is always right.
  sessionData.id = user._id // accessible client as sessionData.id OR sessionData._id
  sessionData.icon = user.icon
  sessionData.username = user.username
  sessionData.displayName = user.displayName
  sessionData.bio = user.bio
  sessionData.joindate = user.createdAt
  res.status(200).json(sessionData)
 
}

exports.authenticate = async (req, res, next) => { 
  
  let sessionData = req.session?.user  // await session.refresh(req, res)
  if (!sessionData) {
    res.status(401).json({
      message: 'User is not logged in',
      error: 'Unauthorized'
    })
    return
  }
  let user = await User.findById(sessionData._id)
  if (!user) {
    res.status(401).json({
      message: 'Session token invalid',
      error: 'Unauthorized'
    })
    return
  }

  //session.refresh(req, res)

  User.updateOne({_id: user._id}, {lastActive: new Date().toISOString()})
  req.session.user = user
  
  //req.session.user = sessionData

  next()
}

exports.register = async (req, res, next) => { 
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      message: "Please fill out all required fields.",
      error: "Bad Request",
    })
  }
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters.",
      error: "Bad Request",
    })
  }
   
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
    })
      .then(async (user) => {
        
        //await session.createsession(req, res, user)
        req.session.user = user
      

        res.status(201).json({
          message: "User successfully created.",
          user: user._id,
        });
      })
      .catch((error) =>
        res.status(500).json({
          message: "User creation failed",
          error: error.message,
        })
      );
  });
};

exports.logout = async (req, res, next) => {
  await req.session.destroy();
  res.status(200).json({
    message: "User logged out",
  });
}

exports.login = async (req, res, next) => {
  
 
  const { username, password } = req.body
  // Check if username and password is provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Please provide username and password.",
      error: "Bad Request",
    })
  }
  try {
    const user = await User.findOne({ username })
    if (!user) {
      res.status(401).json({
        message: "Incorrect username or password.",
        error: "Login Failed",
      })
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(async function (result) {
        if (result) {

          //await session.createsession(req, res, user)
          
          req.session.user = user
         
          

          res.status(200).json({
            message: "Login successful.",
            user: user._id, 
          });
        } else {
          res.status(401).json({
            message: "Incorrect username or password.",
            error: "Login Failed",
          })
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
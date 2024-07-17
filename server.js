const dotenv = require('dotenv');
dotenv.config();

const connectDB = require("./database");

const express = require("express")
const app = express()
const expressWs = require('express-ws')(app)


var cors = require('cors')
var cookies = require("cookie-parser");

const corsOptions = {
  origin: process.env.CORS_ALLOW_ORIGIN,
  credentials: true
};

app.use(cors(corsOptions));
 
app.all('/*', function(req, res, next) {
  // res.header("access-control-expose-headers", "Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Credentials, Authorization");
  next();
});

app.use(cookies());
app.use(express.json())

app.ws('/gateway', require('./gateway') )
app.use("/api/auth", require("./api/auth/route")) 
app.use("/api/message", require("./api/message/route")) 
app.use("/api/channel", require("./api/channel/route")) 


 

const PORT = process.env.PORT

const server = app.listen(PORT, () =>
  console.log(`Serving on port: ${PORT}`)
)

process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})

connectDB();
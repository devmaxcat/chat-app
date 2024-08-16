const cloudinary = require('cloudinary')
const bodyParser = require('body-parser');
const session = require('express-session')
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require("./database");
const redisadapter = require("./database").redisadapter;

cloudinary.config({
  cloud_name: 'dah0ifyer',
  api_key: '143783971293183',
  api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const express = require("express")
const app = express()
const http = require('http');
const server = http.createServer(app);

const path = require('path');



// This code makes sure that any request that does not matches a static file
// in the build folder, will just serve index.html. Client side routing is
// going to make sure that the correct content will be loaded.
app.use((req, res, next) => {
    if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
        next();
    } else {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});
app.use(express.static(path.join(__dirname, 'build')));

const corsOptions = {
  origin: process.env.CORS_ALLOW_ORIGIN,
  methods: ["GET", "POST"],
  credentials: true
};



var io = new require('socket.io')(server, {
  // rejectUnauthorized: false,
  origins: process.env.CORS_ALLOW_ORIGIN,
  cors: corsOptions,
  allowUpgrades: true,
  adapter: redisadapter // if there happened to be multiple servers, redis would use its pub/sub infastructure to replicate websocket messages across servers.
});

const gateway = require('./gateway')
io.on('connection', (socket) => {
  socket.onAny((n, data)=>{
    console.log(n, data)
  })
  gateway(socket, io)
})


var cors = require('cors')
var cookies = require("cookie-parser");
const { User } = require('./schemas/User');



app.use(cors(corsOptions));

app.all('/*', function (req, res, next) {
  // res.header("access-control-expose-headers", "Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Credentials, Authorization");
  next();
});

app.use(cookies());

app.use(express.json()); // Used to parse JSON bodies


// in latest body-parser use like below.
app.use(express.urlencoded({
  extended: true
}));

const sessionware = session({
  name: 'example.sid',
  secret: 'Replace with your secret key',
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 60 * 7,
  rolling: true
  // store: MongoStore.create({
  //     mongoUrl: 'MongoDB URL should be here'
  // })
});

app.use(sessionware);
io.engine.use(sessionware);


app.use("/api/auth", require("./api/auth/route"))
app.use("/api/profile", require("./api/profile/route"))

app.use("/api/friend", require("./api/friends/route"))
app.use("/api/message", require("./api/message/route"))
app.use("/api/channel", require("./api/channel/route"))





const PORT = process.env.PORT


server.listen(PORT, () => {
  console.log('listening on ${PORT}');
});


process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})

connectDB();

User.updateMany({ activityStatus: 1 }, { activityStatus: 0 })
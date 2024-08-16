const Mongoose = require("mongoose")

const localDB = process.env.DB_CONNECTION 

module.exports = async function connectDB() {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log("MongoDB Connected") 
}

Redis = require("ioredis").Redis;
createAdapter = require("@socket.io/redis-adapter").createAdapter

const pubClient = new Redis();
const subClient = pubClient.duplicate();

module.exports.redisadapter = createAdapter(pubClient, subClient)


const Mongoose = require("mongoose")

const localDB = process.env.DB_CONNECTION

module.exports = async function connectDB() {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log("MongoDB Connected")

  const { User } = require('./schemas/User');
  const { Channel } = require('./schemas/Channel');
  const { FriendRequest } = require('./schemas/FriendRequest');
  const { Message } = require('./schemas/Message');
}

Redis = require("ioredis").Redis;
createAdapter = require("@socket.io/redis-adapter").createAdapter

const pubClient = new Redis(process.env.REDIS_CONNECTION);
const subClient = pubClient.duplicate();

module.exports.redisadapter = createAdapter(pubClient, subClient)

pubClient.on("error", (err) => {
  console.log('CLIENT CONN: An error occurred in publishing: ' + err);
});

subClient.on("error", (err) => {
  console.log('CLIENT CONN: An error occurred in subscription: ' + err);
});
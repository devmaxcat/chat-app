const Mongoose = require("mongoose")

const localDB = process.env.DB_CONNECTION 

const connectDB = async () => {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log("MongoDB Connected") 
}

module.exports = connectDB
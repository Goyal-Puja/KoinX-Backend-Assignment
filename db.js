const mongoose = require("mongoose");
const mongoURL = "mongodb://localhost:27017/crypto";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("Connected to Mongo Successfully");
  } catch (error) {
    console.error("Error connectiong to MongoDB", error);
  }
};

module.exports = connectToMongo;

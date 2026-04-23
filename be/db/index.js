const mongoose = require("mongoose");
const DB_NAME = process.env.DB_NAME || "AlgoArena";
const url = process.env.DB_URL || `mongodb://127.0.0.1:27017/${DB_NAME}`;

const dbconnection =  async function () {
  try {
    await mongoose.connect(url);
    console.log(`🔗 Connecting to MongoDB at ${url}...`);
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    throw err; // Rethrow the error to be handled by the caller
  }
};


module.exports = dbconnection;
// This code connects to a MongoDB database using Mongoose.

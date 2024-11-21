import mongoose from "mongoose";
import "dotenv/config";

// connect to database
await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to database");

const db = mongoose.connection;

export default db;

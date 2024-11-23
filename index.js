import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import dogRoutes from './src/routes/dogRoutes.js';
import bathroomLogRoutes from './src/routes/bathroomLogs.js';
import FeedingRoutes from './src/routes/feedingLogs.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); // for parsing application/json

const corsOptions ={
    origin:'*',
   credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration

// connect to database
await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to database");

app.get("/", (req, res) => {
  res.send("Welcome to the API.");
});

app.use('/api/dogs', dogRoutes);
app.use('/api/bathroom-logs', bathroomLogRoutes);
app.use('/api/feeding', FeedingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})

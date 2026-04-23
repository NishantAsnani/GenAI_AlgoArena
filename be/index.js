require('dotenv').config();
const express=require('express')
const app=express();
const PORT=process.env.PORT || 3000;
const cors=require('cors')
const routes=require('./routes/index')
const bodyParser=require('body-parser')
const dbconnection = require('./db');




(async () => {
await dbconnection();
})();


app.use(cors({
  origin: 'http://localhost:5173', // <-- Replace with your exact frontend URL (e.g., React/Vite port)
  credentials: true,               // <-- This allows cookies and Authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Middleware to parse JSON and URL-encoded data


app.use('/api',routes)



app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports=app; // Export app for testing
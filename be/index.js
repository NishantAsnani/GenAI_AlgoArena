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
  origin:process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true,               
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options(/.*/, cors());

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api',routes)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports=app; 
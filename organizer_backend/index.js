const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const mongoose = require('mongoose')

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT
// Routes
app.use('/api/users', require('./routes/userRoutes'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Db connected & Server running on port ${PORT}`)))
    .catch(err => console.log(err));
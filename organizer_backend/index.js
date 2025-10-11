const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRouter = require('./routes/userRouter');
require('dotenv').config();
const planRoutes = require("./routes/planRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'https://libpathasala.netlify.app'
  }));  
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/users', userRouter);
app.use("/api/plans", planRoutes);
// app.use("/api/queries",querryRoutes );


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Db connected & Server running on port ${PORT}`)))
    .catch(err => console.log(err));

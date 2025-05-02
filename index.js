const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const schema = require('./Schema');

const app = express();
const port = 3010;

app.use(express.json());
app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.post('/register', async(req,res) =>{
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const user = new schema({ username, email, password: hash});
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

app.post('/login', async(req,res) => {
  const { email, password } = req.body;
  if(!email || !password){
    return res.status(400).send({ message:"All fields are required" });
  }
  try {
    const user = await schema.findOne({email});
    if(!user){
      return res.status(404).send({ message:"Register first "});
    }
    const correctPassword = bcrypt.compareSync(password, user.password);
    if(!correctPassword){
      return res.status(404).send({ message:"Password is incorrect" });
    }

    return res.status(201).send({ message:"Successfully logged in "});

  } catch (error) {
    console.log(error);
    return res.status(500).send({ message:"Something went wrong "});
  }
});

mongoose.connect(process.env.MONGO_URI)
.then(() =>{
  console.log('MongoDB connected');
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

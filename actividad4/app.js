const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

// Body-parser middleware
app.use(bodyParser.json());

// Connect to MongoDB
const uri = "mongodb+srv://envialibre:8kEza19QqfpwSlqi@cluster0.lgltjls.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Check MongoDB connection
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Check for MongoDB connection error
db.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Define User model
const User = mongoose.model('User', {
  name: String,
  email: String
});

// Routes
// Create a user
app.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific user
app.get('/users/:id', getUser, (req, res) => {
  res.json(res.user);
});

// Update a user
app.patch('/users/:id', getUser, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Middleware to get user by ID
async function getUser(req, res, next) {
    let user;
    try {
      user = await User.findOne({ _id: req.params.id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
    res.user = user;
    next();
  }
  
// Delete a user
app.delete('/users/:id', getUser, async (req, res) => {
    try {
      await User.deleteOne({ _id: req.params.id });
      res.json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

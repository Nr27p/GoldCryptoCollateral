const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtDecode } = require("jwt-decode");
const {User} = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phoneNumber,publickeymetamask } = req.body;

      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        publickeymetamask,
      });
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the user with the provided username exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // If the credentials are valid, generate a JWT token with a 1-hour expiration
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '1h', // You can adjust the token expiration time
      });
      const role = 'user'
      // Send the token back to the frontend
      res.json({ token ,role, userId:user._id});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/logout', (req, res) => {
    // Assuming the client is storing the JWT token in an HTTP-only cookie named 'token'
    res.clearCookie('token'); 

    res.json({ message: 'Logout successful' });
  });

  router.get('/check-auth', async (req, res) => {
    try {
      // Extract the token from the request headers
      const token = req.headers.authorization;
  
      if (!token) {
        // If no token is provided, the user is not authenticated
        return res.json({ isAuthenticated: false });
      }
  
      // Decode the token
      const decoded = jwtDecode(token);
  
      // Fetch additional user details from the database using the decoded user ID
      const user = await User.findOne({ _id: decoded.userId });
  
      if (!user) {
        // If the user is not found, consider them not authenticated
        return res.json({ isAuthenticated: false });
      }
  
      // Send the authenticated status and user details to the client
      res.json({
        isAuthenticated: true,
        user: {
          userId: user._id,
          username: user.username, // Adjust this based on your user schema
        },
      });
    } catch (error) {
      console.error('Error checking authentication status:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  // router.post('/centraladminregister', async (req, res) => {
  //   try {
  //     const { username, email, password, age, post, publicid, premiseid } = req.body;
  
  //     // Check if the username or email already exists
  //     const existingUser = await CentralAdmin.findOne({ $or: [{ username }, { email }] });
  //     if (existingUser) {
  //       return res.status(400).json({ message: 'Username or email already exists' });
  //     }
  
  //     // Hash the password
  //     const hashedPassword = await bcrypt.hash(password, 10);
  
  //     // Create a new central admin instance
  //     const newCentralAdmin = new CentralAdmin({
  //       username,
  //       email,
  //       password: hashedPassword,
  //       age,
  //       post,
  //       publicid,
  //       premiseid,
  //     });
  
  //     // Save the new central admin to the database
  //     await newCentralAdmin.save();
  
  //     res.status(201).json({ message: 'Central admin registered successfully' });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // });

module.exports = router;
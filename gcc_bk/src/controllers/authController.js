// backend/src/controllers/authController.js
const User = require('../models/User');
const web3 = require('../config/web3');

exports.getNonce = async (req, res) => {
  const { address } = req.params;
  try {
    let user = await User.findOne({ address });
    if (!user) {
      const nonce = Math.floor(Math.random() * 1000000).toString();
      user = new User({ address, nonce });
      await user.save();
    }
    res.json({ nonce: user.nonce });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const express = require('express');
const router = express.Router();
const {User} = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const passport = require('passport');

/**
 * @route  GET api/users/test
 * @desc   Tests users route
 * @access public
 */
router.get('/test', (req, res) => {
  return res.json({msg: "users works"});
});

/**
 * @route  GET api/users/register
 * @desc   Register a user
 * @access public
 */
router.post('/register', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({email: 'Email already exists'});
  } else {
    const avatar = gravatar.url(req.body.email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    });
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      avatar, 
      password: req.body.password
    });
    try {
      const newUser = await user.save();
      res.json(newUser);
    } catch (err) {
      console.log(err)
    }
  }
});

/**
 * @route  GET api/users/login
 * @desc   Login user / returns jwt
 * @access public
 */
router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({email: 'User not found'});
  }
  let correctPassword = await bcrypt.compare(password, user.password);
  if (correctPassword) {
    let token = await user.generateAuthToken();
    if (token) {
      res.json({ token: `Bearer ${token}` });
    }
  } else {
    res.status(400).json({password: 'Incorrect password'});
  }
});

/**
 * @route  GET api/users/current
 * @desc   Returns current user
 * @access private
 */
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
});

module.exports = router;
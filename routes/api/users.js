const express = require('express');
const router = express.Router();
const { User } = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// load validation
const { validateRegisterInput } = require('../../validation/register');
const { validateLoginInput } = require('../../validation/login');

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
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    errors.email = 'Email already exists'
    return res.status(400).json(errors);
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
  const { errors, isValid } = validateLoginInput(req.body);
  const email = req.body.email;
  const password = req.body.password;
  if (!isValid) {
    return res.status(400).json(errors);
  }
  let user = await User.findOne({ email });
  if (!user) {
    errors.email = 'User not found'
    res.status(404).json(errors);
  }
  try {
    let correctPassword = await bcrypt.compare(password, user.password);
    if (correctPassword) {
      let token = await user.generateAuthToken();
      if (token) {
        res.json({ token: `Bearer ${token}` });
      }
    } else {
      errors.password = 'Incorrect password'
      res.status(400).json(errors);
    }
  } catch (err) {
    return console.log(err);
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
const express = require('express');
const router = express.Router();
const {User} = require('../../models/User');
const gravatar = require('gravatar');

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

module.exports = router;
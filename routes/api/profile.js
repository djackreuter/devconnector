const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const { Profile } = require('../../models/Profile');
const { User } = require('../../models/User');

/**
 * @route  GET api/profile/test
 * @desc   Tests profile route
 * @access public
 */
router.get('/test', (req, res) => {
  return res.json({msg: "profile works"});
});

/**
 * @route  GET api/profile
 * @desc   get current users profile
 * @access private
 */
router.get('/', passport.authenticate('jwt', { session: false }), 
(req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id }).then((profile) => {
    if (!profile) {
      errors.noprofile = 'Profile does not exist'
      return res.status(404).json(errors);
    }
    return res.json(profile);
  }).catch((err) => res.status(400).json(err));
});

module.exports = router;
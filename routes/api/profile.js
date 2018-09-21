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

/**
 * @route  POST api/profile
 * @desc   create or edit users profile
 * @access private
 */
router.post('/', passport.authenticate('jwt', { session: false }), 
(req, res) => {
  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername) { 
    profileFields.githubusername = req.body.githubusername;
  }
  if (typeof req.body.skills !== undefined) {
    profileFields.skills = req.body.skills.split(',');
  }
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then((profile) => {
    if (profile) {
      // update
      Profile.findOneAndUpdate(
        { user: req.user.id }, 
        { $set: profileFields }, 
        { new: true }
      ).then((profile) => res.json(profile));
    } else {
      // create
      Profile.findOne({ handle: profileFields.handle }).then((profile) => {
        if (profile) {
          errors.handle = 'That handle is already in use';
          return res.status(400).json(errors);
        }
        return new Profile(profileFields).save().then((newProfile) => res.json(newProfile));
      });
    }
  }).catch((err) => res.status(400).json(err));
});

module.exports = router;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const request = require('request');

const { Profile } = require('../../models/Profile');
const { User } = require('../../models/User');
const { validateProfileInput } = require('../../validation/profile');
const { validateExperienceInput } = require('../../validation/experience');
const { validateEducationInput } = require('../../validation/education');

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
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'Profile does not exist'
        return res.status(404).json(errors);
      }
    return res.json(profile);
  }).catch((err) => res.status(400).json(err));
});

/**
 * @route  GET api/profile/all
 * @desc   get all users profile
 * @access public
 */
router.get('/all', async (req, res) => {
  let errors = {};
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    if (!profiles) {
      errors.noprofile = 'No profiles found';
      return res.status(404).json(errors);
    }
    return res.json(profiles);
  } catch (err) {
    res.status(400).json(err);
  }
});

/**
 * @route  GET api/profile/handle/:handle
 * @desc   get users profile by handle
 * @access public
 */
router.get('/handle/:handle', async (req, res) => {
  let errors = {};
  try {
    const profile = await Profile.findOne({ handle: req.params.handle })
      .populate('user', ['name', 'avatar']);
    if (!profile) {
      errors.noprofile = 'Profile does not exist';
      return res.status(404).json(errors);
    }
    return res.json(profile);
  } catch (err) {
    return res.status(400).json(err);
  }
});

/**
 * @route  GET api/profile/user/:user_id
 * @desc   get user by user id
 * @access public
 */
router.get('/user/:user_id', async (req, res) => {
  let errors = {};
  try {
    const profile = await Profile.findOne({ user: req.params.user_id })
      .populate('user', ['name', 'avatar']);
    if (!profile) {
      errors.noprofile = 'Profile not found';
      return res.status(404).json(errors);
    }
    return res.json(profile);
  } catch (err) {
    return res.status(400).json(err);
  }
});

/**
 * @route  GET api/profile/github/:username/:count/:sort
 * @desc   get github repos
 * @access public
 */
router.get('/github/:username/:count/:sort', (req, res) => {
  const username = req.params.username;
  const count = req.params.count;
  const sort = req.params.sort;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const options = {
    url: `https://api.github.com/users/${username}/repos?per_page=${count}&sort=${sort}&client_id=${clientId}&client_secret=${clientSecret}`,
    headers: {
      "User-Agent": "request"
    }
  };
  const callback = (err, response, body) => {
    if (!err && response.statusCode == 200) {
      const info = JSON.parse(body);
      res.json(info);
    }
  }
  request(options, callback);
});

/**
 * @route  POST api/profile
 * @desc   create or edit users profile
 * @access private
 */
router.post('/', passport.authenticate('jwt', { session: false }), 
(req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

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

/**
 * @route  POST api/profile/experience
 * @desc   add experience to profile
 * @access private
 */
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({ user: req.user.id }).then((profile) => {
    let newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.experience.unshift(newExp);
    profile.save().then((profile) => res.json(profile));
  }).catch((err) => res.status(400).json(err));
});

/**
 * @route  POST api/profile/education
 * @desc   add education to profile
 * @access private
 */
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Profile.findOne({ user: req.user.id }).then((profile) => {
    let newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.education.unshift(newEdu);
    profile.save().then((profile) => res.json(profile));
  }).catch((err) => res.status(400).json(err));
});

/**
 * @route  DELETE api/profile/experience/:exp_id
 * @desc   remove experience
 * @access private
 */
router.delete('/experience/:exp_id', 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      profile.experience = profile.experience.filter((exp) => exp._id != req.params.exp_id);
      profile.save().then((profile) => res.json(profile));
    }).catch((err) => res.status(404).json(err));
});

/**
 * @route  DELETE api/profile/education/:edu_id
 * @desc   remove education
 * @access private
 */
router.delete('/education/:edu_id', 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      profile.education = profile.education.filter((edu) => edu._id != req.params.edu_id);
      profile.save().then((profile) => res.json(profile));
    }).catch((err) => res.status(404).json(err));
});

/**
 * @route  DELETE api/profile/
 * @desc   delete user and profile
 * @access private
 */
router.delete('/', passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() => {
        return res.json({ success: true });
      });
    });
});

module.exports = router;
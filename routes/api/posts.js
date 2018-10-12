const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const { Post } = require('../../models/Post');
const { validatePostInput } = require('../../validation/post');


/**
 * @route  GET api/posts/
 * @desc   get all posts
 * @access public
 */
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    if (!!posts) {
      return res.status(404).send('No posts exist')
    }
    return res.json(posts);
  } catch (err) {
    return res.status(400).json(err);
  }
});

/**
 * @route  POST api/posts/
 * @desc   create a post
 * @access private
 */
router.post('/', passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then((post) => res.json(post));
});

module.exports = router;
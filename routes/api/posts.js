const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const { Post } = require('../../models/Post');
const { Profile } = require('../../models/Profile');
const { validatePostInput } = require('../../validation/post');


/**
 * @route  GET api/posts/
 * @desc   get all posts
 * @access public
 */
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({date: -1});
    return res.json(posts);
  } catch (err) {
    return res.status(404).json({nopostsfound: 'No posts found'});
  }
});

/**
 * @route  GET api/posts/:id
 * @desc   get post by id
 * @access public
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.json(post);
  } catch (err) {
    return res.status(404).json({nopostfound: 'No post found'});
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

/**
 * @route  POST api/posts/:id
 * @desc   delete a post
 * @access private
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    Profile.findOne({user: req.user.id}).then((profile) => {
      Post.findById(req.params.id).then((post) => {
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({notauthorized: 'User not authorized'});
        }
        Post.remove().then(() => res.json({success: true}));
      });
    }).catch((err) => res.status(404).json({postnotfound: 'Post not found'}));
});

/**
 * @route  POST api/posts/like/:id
 * @desc   like post
 * @access private
 */
router.post('/like/:postId', passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    const { postId } = req.params;
    Post.findById(postId, (error, post) => {
      if (!post || error) {
        return res.status(404).json({error, msg: 'Post not found'});
      }
      const index = post.likes.findIndex((value) => value.user == req.user.id);
      if (index === -1) {
        post.likes.push({ user: req.user.id });
      } else {
        post.likes.splice(index, 1);
      }
      post.save().then((savedPost) => {
        return res.json(savedPost);
      });
    });
});

/**
 * @route  POST api/posts/comment/:postId
 * @desc   like post
 * @access private
 */
router.post('/comment/:postId', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  }
  Post.findById(req.params.postId).then((post) => {
    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    }
    post.comments.unshift(newComment);
    post.save().then((post) => res.json(post));
  }).catch((err) => res.status(404).json({postnotfound: 'No post found', err}));
});

/**
 * @route  DELETE api/posts/:id/comment/:commentId
 * @desc   like post
 * @access private
 */
router.delete('/:id/comment/:commentId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.id).then((post) => {
    const commentToDelete = post.comments.find((comment) => comment._id == req.params.commentId);
    if (req.user.id != commentToDelete.user) {
      return res.status(401).json({cannotdelete: 'You don\'t have permission to delete this comment'});
    }
    if (post.comments.filter((comment) => comment._id == req.params.commentId).length === 0) {
      return res.status(404).json({commentnotexists: 'Comment does not exist'});
    }
    const index = post.comments.indexOf(commentToDelete);
    post.comments.splice(index, 1);
    post.save().then((post) => res.json(post));
  }).catch((err) => res.status(404).json({postnotfound: 'No post found', err}));
});

module.exports = router;
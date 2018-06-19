const express = require("express");
const router = express.Router();
const mongoose = require("express");
const passport = require("passport");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const postInputValidation = require("../../validation/post");

// @route     GET api/posts/test
// @desc      (description) tests post route
// @access    Public
router.get("/test", (req, res) => res.json({ message: "posts works" }));

// @route     GET api/posts
// @desc      get posts
// @access    Public

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json({ nopostsfound: "no posts found" }));
});

// @route     GET api/posts/:id
// @desc      get post by id
// @access    Public

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post);
    })
    .catch(err => res.status(404).json({ nopostsfound: "no post found" }));
});

// @route     DELETE api/posts/:id
// @desc      delete post by id
// @access    Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req);
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "user not authorized" });
          }
          post
            .remove()
            .then(() => {
              res.json({ success: true });
            })
            .catch(error =>
              res.status(404).json({ postnotfound: "post wasn't found" })
            );
        });
      })
      .catch(err => res.status(404).json({ nopostsfound: "no posts found" }));
  }
);

// @route     POST api/posts/like/:id
// @desc      like post
// @access    Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req);
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "User already liked this post" });
        }
        //add userId to the likes array
        post.likes.unshift({ user: req.user.id });
        post.save().then(post => {
          res.json(post);
        });
      });
    });
  }
);

// @route     POST api/posts/unlikelike/:id
// @desc      like post
// @access    Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req);
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ notliked: "You haven't liked this post yet" });
        }
        //get remove index
        const removeIndex = post.likes.map(element => {
          element.user.toString().indexOf(req.user.id);
        });
        //splice out of array
        post.likes.splice(removeIndex, 1);
        post.save().then(post => {
          res.json(post);
        });
      });
    });
  }
);

// @route     POST api/posts/comment/:id
// @desc      add a comment to a post
// @access    Private

router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = postInputValidation(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          image: req.body.image,
          user: req.user.id
        };
        //add to comments array
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "no post found" }));
  }
);

// @route     DELETE api/posts/comment/:id/:comment_id
// @desc      delete comment from post
// @access    Private

router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // check to see if comment exists
        if (post.comments.filter(comment => comment._id.toString()=== req.params.comment_id).length === 0){
          res.status(404).json({commentnotfound: "comment not found"})
        }
        //get remove index
        const removeIndex = post.comments.map(element => {
          element._id.toString()
          .indexOf(req.params.comment_id)
        })
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post))
      })
      .catch(err => res.status(404).json({ postnotfound: "no post found" }));
  }
);

// @route     POST api/posts
// @desc      Create post
// @access    Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = postInputValidation(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      image: req.body.image,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

module.exports = router;

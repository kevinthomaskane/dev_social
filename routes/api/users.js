const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req, res, cb){
    cb(null, "uploads/")
  },
  filename: function(req, res, cb){
    console.log(res)
    cb(null, res.originalname)
  }
})
const upload = multer({ storage: storage });

//load input validation
const validateRegisterInput = require("../../validation/register");
const validateLogin = require("../../validation/login");

// @route     GET api/users/test
// @desc      (description) users post route
// @access    Public

router.get("/test", (req, res) => res.json({ message: "users works" }));

// @route     GET api/users/register
// @desc      register a user
// @access    Public

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" //default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route     GET api/users/login
// @desc      login user/ return json webtoken
// @access    Public

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLogin(req.body);
  //check validation
  if (!isValid) {
    errors.email = "Email is invalid";
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //find user by email
  User.findOne({ email: email }).then(user => {
    //check for user
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    }
    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //user matched
        const payload = { id: user.id, name: user.name, avatar: user.avatar, image: user.image }; //create jwt payload
        //sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 360000 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route     POST api/users/picture
// @desc      add a profile picture
// @access    Private
router.post(
  "/picture",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  (req, res) => {
   
    console.log(req.file);
    const errors = {};
    User.findOne({ _id: req.user.id }).then(user => {
      console.log("user", user)
      if (user) {
        User.findOneAndUpdate(
          {
            _id: req.user.id
          },
          { $set: {image : req.file.path} },
          { 
            new: true
          }
        ).then(user => res.json(user));
      }
    });
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
  }
);

// @route     GET api/users/current
// @desc      return current user
// @access    Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
  }
);

module.exports = router;

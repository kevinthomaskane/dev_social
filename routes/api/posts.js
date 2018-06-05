const express = require('express');
const router = express.Router();

// @route     GET api/posts/test
// @desc      (description) tests post route
// @access    Public
router.get('/test', (req, res) => res.json({message: 'posts works'}))

module.exports = router;
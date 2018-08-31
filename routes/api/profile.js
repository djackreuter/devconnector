const express = require('express');
const router = express.Router();

/**
 * @route  GET api/profile/test
 * @desc   Tests profile route
 * @access public
 */
router.get('/test', (req, res) => {
  return res.json({msg: "profile works"});
});

module.exports = router;
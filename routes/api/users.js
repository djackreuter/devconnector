const express = require('express');
const router = express.Router();

/**
 * @route  GET api/users/test
 * @desc   Tests users route
 * @access public
 */
router.get('/test', (req, res) => {
  return res.json({msg: "users works"});
});

module.exports = router;
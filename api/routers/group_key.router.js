let express = require('express');
let router = express.Router();
const groupKeyController = require('../controllers/group_key.controller');
let { verifyToken } = require('../middlewares/verify_token');

router.post("/", verifyToken, groupKeyController.create);

module.exports = router;
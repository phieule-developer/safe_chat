let express = require('express');
let router = express.Router();
const messageController = require('../controllers/message.controller');
let {verifyToken} = require('../middlewares/verify_token');

router.post("/:id",verifyToken,messageController.sendMessage);
router.get("/:id",verifyToken,messageController.getAllMessage);

module.exports = router;
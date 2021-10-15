let express = require('express');
let router = express.Router();
const bodyParser = require('body-parser');
const cors = require("cors");
router.use(cors());
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());

router.use("/api/v1/auth",require('./auth.router'));
router.use("/api/v1/conversation",require('./conversation.router'));
router.use("/api/v1/message",require('./message.router'));
router.use("/api/v1/user",require('./user.router'));
router.use("/api/v1/friend",require('./friend.router'));
module.exports = router;
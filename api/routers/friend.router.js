let express = require('express');
let router = express.Router();
const friendController = require('../controllers/friend.controller');
let { verifyToken } = require('../middlewares/verify_token');

router.post("/:id", verifyToken, friendController.create);
router.get("", verifyToken, friendController.getAll);
router.get("/pending/request", verifyToken, friendController.getAllPendingFriendRequest);
router.get("/all/request/", verifyToken, friendController.getAllFriendRequest);
router.get("/:id", verifyToken, friendController.getOne);
router.put("/:id", verifyToken, friendController.update);
router.delete("/:id", verifyToken, friendController.remove);

module.exports = router;
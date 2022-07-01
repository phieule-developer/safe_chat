let express = require('express');
let router = express.Router();
const userController = require('../controllers/user.controller');
let { verifyToken } = require('../middlewares/verify_token');

router.get("/me", verifyToken, userController.getMe);
router.put("/", verifyToken, userController.updateMe);
router.get("/",verifyToken,userController.getAll);
router.get("/:id",verifyToken,userController.getOne);
router.get("/get/all",verifyToken,userController.getAllUser);
router.get("/public_key/:public_key",verifyToken,userController.getOneByPublicKey);
router.get("/add_conversation/:conversation_id",verifyToken,userController.searchUserAddConversation);

module.exports = router;
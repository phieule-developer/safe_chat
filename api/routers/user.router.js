let express = require('express');
let router = express.Router();
const userController = require('../controllers/user.controller');
let { verifyToken } = require('../middlewares/verify_token');

router.get("/me", verifyToken, userController.getMe);
router.put("/", verifyToken, userController.updateMe);
router.get("/",verifyToken,userController.getAll);

module.exports = router;
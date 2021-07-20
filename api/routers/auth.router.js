let express = require('express');
let router = express.Router();
const authController = require('../controllers/auth.controller');

router.post("/login", authController.login);
router.post('/register', authController.register);

router.get("/check_session", authController.check_session);

module.exports = router;
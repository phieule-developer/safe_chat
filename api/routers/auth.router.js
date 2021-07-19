let express = require('express');
let router = express.Router();
const authController = require('../controllers/auth.controller');

router.post("/login",authController.login);
router.post('/register',authController.register);

module.exports = router;
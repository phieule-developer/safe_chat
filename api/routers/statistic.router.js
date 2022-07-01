let express = require('express');
let router = express.Router();
const statisticController = require('../controllers/statistic.controller');
let { verifyToken } = require('../middlewares/verify_token');

router.get("/amount_user", verifyToken, statisticController.getAmountUser);

module.exports = router;
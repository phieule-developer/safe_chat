let express = require('express');
let router = express.Router();
const conservationController = require('../controllers/converation.controller');
let {verifyToken} = require('../middlewares/verify_token');

router.post("/",verifyToken,conservationController.create);
router.get("/",verifyToken,conservationController.getAll);

module.exports = router;
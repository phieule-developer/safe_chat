let express = require('express');
let router = express.Router();
const conservationController = require('../controllers/converation.controller');
let {verifyToken} = require('../middlewares/verify_token');

router.post("/",verifyToken,conservationController.create);
router.get("/",verifyToken,conservationController.getAll);
router.get("/:id",verifyToken,conservationController.getOne);
router.put("/:id",verifyToken,conservationController.update);
router.put("/add/:id",verifyToken,conservationController.addMember);
router.delete("/leave/:id",verifyToken,conservationController.leaveConversation);


module.exports = router;
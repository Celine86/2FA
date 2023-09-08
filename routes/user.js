const express = require('express'); 
const router = express.Router();
const ctrl = require("../controllers/user");
const check = require("../middleware/check");

router.post("/signup", check.password, ctrl.signup);
router.post("/login", ctrl.login);

module.exports = router;
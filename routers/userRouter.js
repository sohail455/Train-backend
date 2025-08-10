const userController = require("../controller/userController");
const authController = require("../controller/authController");

const express = require("express");
const router = express.Router();

router.post("/signup", authController.SignUp);
router.post("/login", authController.LogIn);
router.post("/logout", authController.logout);
router.post("/forgotpassword", authController.forgotPassword);

router.post(
  "/updatepassword",
  authController.protect,
  authController.updatePassword
);

module.exports = router;

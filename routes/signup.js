const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { check, body } = require("express-validator/check");
const User = require("../model/users");

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a Valid Email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      }),
    body(
      "password",
      "please enter password of text and number and at least 5 character"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmpassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("password have to match");
      }
      return true;
    })
  ],
  authController.postSignup
);

module.exports = router;

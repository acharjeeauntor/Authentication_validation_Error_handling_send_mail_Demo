const express = require("express");
const User = require("../model/users");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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"
    }
  })
);

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({ where: { email: email } })
    .then((userDoc) => {
      if (userDoc) {
        console.log("already has a account with this email");
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hassedPassword) => {
          const user = new User({
            name: name,
            email: email,
            password: hassedPassword
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
          return transporter.sendMail({
            to: email,
            from: "acharjeeauntor@gmail.com",
            subject: "Signup  Succeeded!",
            html: "<h1>You Successfully Signed up!</h1>"
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup");
};

exports.postLogin = (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        console.log("Email Dosenot exist!!");
        return res.redirect("/signup");
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            return res.render("welcome");
          }
          console.log("password Do not match");
          return res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login");
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset");
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (!user) {
          console.log("Email Not Exist!");
          res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "acharjeeauntor@gmail.com",
          subject: "Password Reset",
          html: `
          <p>You request a password Reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}" >Link</a> to set a new Password</p>
          `
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    where: { resetToken: token, resetTokenExpiration: { [Op.gt]: Date.now() } }
  })
    .then((user) => {
      res.render("auth/new-password", {
        userId: user.id,
        resetToken: token
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;
  let resetUser;

  User.findOne({
    where: {
      resetToken: resetToken,
      resetTokenExpiration: { [Op.gt]: Date.now() },
      id: userId
    }
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hassedPassword) => {
      resetUser.password = hassedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};

const db = require("../models"); 
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
//const auth = require("../middleware/auth");
require('dotenv').config();
//const fs = require("fs");
const xss = require("xss");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
        user: process.env.MAIL_ACCOUNT,
        pass: process.env.MAIL_PSWD
    }
})

exports.signup = async (req, res, next) => {
  if (req.body.username && req.body.email && req.body.password && req.body.verifyPassword) {
    try {
      const user = await db.User.findOne({
        where: { [Op.or]: [{username: req.body.username}, {email: req.body.email}] },
      });
      if (user !== null) {
          return res.status(401).json({ error: "Ce pseudonyme ou cet e-mail est déjà utilisé" });
      } else { 
        if (req.body.password === req.body.verifyPassword) {
          const hashed = await bcrypt.hash(req.body.password, 10)
          db.User.create({
              username: xss(req.body.username),
              email: xss(req.body.email),
              password: hashed,
          });
          res.status(201).json({ message: "Votre compte est créé. Vous pouvez vous connecter avec votre identifiant et mot de passe !" });
        } else {
          return res.status(401).json({ error: "Les mots de passe ne correspondent pas" });
        }
      }
    } catch (error) {
      return res.status(500).json({ error: "Erreur Serveur" });
    }
  } else {
    return res.status(401).json({ error: "Vous devez renseigner tous les champs pour vous inscrire !" });
  }
};

exports.login = async (req, res, next) => {
  const user = await db.User.findOne({ where: {email: req.body.email} });
  if (user) {
    try {
      const { email } = req.body;
        // Generate a new OTP code and send it via email
      this.otpCode = Math.floor(100000 + Math.random() * 900000);

      user.otp = this.otpCode
      await user.save({ fields: ["otp"],});

        const mailOptions = {
        from: process.env.MAIL_ACCOUNT,
        to: email,
        subject: "OTP",
        text: `Ton code : ${this.otpCode}.`,
      };
    transporter.sendMail(mailOptions, (error, _info) => {
      if (error) {
        console.error('Error sending email: ', error);
        res.status(500).send({ message: 'Failed to send OTP' });
      } else {
        console.log('OTP sent: ', this.otpCode);
        res.status(200).send({ message: 'OTP sent successfully' });
      }
    });
    } catch (error) {
      return res.status(500).json({ error: "Erreur Serveur" });
    }
  }  else {
    res.status(401).send({ message: 'Enter e-mail' });
  }
};

exports.verifyotp = async (req, res, next) => {
  const user = await db.User.findOne({ where: {email: req.body.email}, });
  const thisotp = await db.User.findOne({
    attributes: ["otp"], 
    where: {email: req.body.email}, 
    raw: true,
  });

  //const thisotp2 = JSON.stringify(thisotp);
  //const thisotp3 = JSON.parse(thisotp2);

  const thisotp2 = thisotp.otp;


  console.log(thisotp2);

  const { otp } = req.body;
  if (otp === thisotp2 && otp!=0) {
    res.status(200).json({
      message: "Vous êtes connecté !",
      username: user.username,
      email: user.email,
      userId: user.id,
      token: jwt.sign({userId: user.id}, process.env.TOKEN, {expiresIn: '24h'}),
  })
  } else {
    res.status(401).send({ message: 'Invalid OTP' });
  }
};

/*
exports.login = async (req, res, next) => {
  try {
    const user = await db.User.findOne({ where: {email: req.body.email} });
    if (user === null) {
      return res.status(401).json({ error: "Connexion impossible, merci de vérifier votre login" });
    } else {
      const hashed = await bcrypt.compare(req.body.password, user.password);
      if (!hashed) {
        return res.status(401).json({ error: "Le mot de passe est incorrect !" })
      } else {
          res.status(200).json({
              message: "Vous êtes connecté !",
              username: user.username,
              email: user.email,
              userId: user.id,
              token: jwt.sign({userId: user.id}, process.env.TOKEN, {expiresIn: '24h'}),
          })
      }
    }
  } catch (error) {
    return res.status(500).json({ error: "Erreur Serveur" });
  }
};
*/

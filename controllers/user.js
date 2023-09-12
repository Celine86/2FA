const db = require("../models"); 
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
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
  try {
    const user = await db.User.findOne({
      where: {email: req.body.email},
    });    
  if (user === null) {
    return res.status(401).json({ error: "Connexion impossible, merci de vérifier votre login" });
    } else {
      const hashed = await bcrypt.compare(req.body.password, user.password);
      if (!hashed) {
        return res.status(401).json({ error: "Le mot de passe est incorrect !" });
      } else {
        const { email } = req.body;
        this.otpCode = Math.floor(100000 + Math.random() * 900000);
        // Le code OTP expire au bout de 5 minutes 
        const expires = new Date(Date.now() + 5*60*1000);
        user.otp = this.otpCode;
        user.otpcreated = Date.now();
        user.otpexpires = expires;
        await user.save({ fields: ["otp", "otpcreated", "otpexpires"],});
          const mailOptions = {
          from: process.env.MAIL_ACCOUNT,
          to: email,
          subject: "OTP",
          text: `Ton code OTP : ${this.otpCode}.`,
        };
        transporter.sendMail(mailOptions, (error, _info) => {
          if (error) {
            res.status(500).send({ message: 'Le code otp n\'a pas pu être envoyé' });
          } else {
            res.status(200).send({ message: 'Code OTP envoyé' });
          }
        });
      } 
    } 
  } catch (error) {
    return res.status(500).json({ error: "Erreur Serveur" });
  }
};

exports.verifyotp = async (req, res, next) => {
  const user = await db.User.findOne({ where: {email: req.body.email}, });
  const thisotp = await db.User.findOne({
    attributes: ["otp", "otpcreated", "otpexpires"], 
    where: {email: req.body.email}, 
    raw: true,
  });
  const thisotpverify = thisotp.otp;
  const thisotpexpires = thisotp.otpexpires;
  /* Transformation de la date d'expiration du code OTP récupéré en BDD 
  en nombre de milisecondes écoulées depuis le 1er janvier 1970 afin de comparer cela à ce que renvoie la fonction Date.now() */
  const dateotp = new Date(thisotpexpires)
  const datenowtocompare = dateotp.getTime();
  const datenow = Date.now();  
  const { otp } = req.body;
  if (otp === thisotpverify && otp!=0 && datenowtocompare > datenow) {
    res.status(200).json({
      message: "Vous êtes connecté !",
      username: user.username,
      email: user.email,
      userId: user.id,
      token: jwt.sign({userId: user.id}, process.env.TOKEN, {expiresIn: '24h'}),
  })
  } else {
    res.status(401).send({ message: 'Code OTP Invalide' });
  }
};
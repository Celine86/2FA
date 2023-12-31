const db = require("../models");
const bcrypt = require("bcrypt");
require('dotenv').config();

function firstAdmin(req, res) {
  db.User.findOne({ where: { username: process.env.ACCOUNT_USERNAME } })
    .then((user) => {
      if (!user) {
        bcrypt.hash(process.env.PASSWORD, 10)
          .then((hash) => {
            db.User.create({
              username: process.env.ACCOUNT_USERNAME,
              email: process.env.ACCOUNT_EMAIL,
              password: hash,
            })
              .then((account) => {
                console.log(`Le compte ${account.username} a été créé!`)
              })
              .catch((error) => { 
                console.log(error);
                res.status(400).json({ error });
              });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send({ error });
          });
      } else {
        console.log("le compte existe déjà");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
module.exports = firstAdmin();
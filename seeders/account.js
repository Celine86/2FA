const db = require("../models");
const bcrypt = require("bcrypt");
require('dotenv').config();

function firstAdmin(req, res) {
  db.User.findOne({ where: { username: "test" } })
    .then((user) => {
      if (!user) {
        bcrypt.hash(process.env.TESTPASSWORD, 10)
          .then((hash) => {
            db.User.create({
              username: "test",
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
        console.log("le compte test existe déjà");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
module.exports = firstAdmin();
// Create and Sync Tables 

const db = require("./models/index");
db.sequelize.sync()

// Create Admin, Modo and User account

.then(function () {
  require("./seeders/account");
})
.catch((error) => {
  console.log(error);
});

// Sync Tables and force modifications 
// Note, set force to true if error "Too many keys specified; max 64 keys allowed"
//db.sequelize.sync({ alter: true, force: false })

const express = require('express'); 
const app = express();
const path = require("path");

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
}); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', require('./routes/user'));

module.exports = app;
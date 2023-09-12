'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
    }
  };
  User.init({
    id: {type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING },
    otpcreated : { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, 
    otpexpires : { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, 
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
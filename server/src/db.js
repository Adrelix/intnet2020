'use strict';

const bcrypt = require('bcrypt');
const path = require('path');
const sequelize = require('sequelize');
// const user = require('./models/user.model');

const seq = new sequelize('', '', '', {
  dialect: 'sqlite',
  storage: path.join(__dirname, './database.sqlite'),
  operatorsAliases: '0',
});

const Todos = seq.define('todos', {
  username: {
    type: sequelize.STRING,
  },
  header: {
    type: sequelize.STRING,
  },
  desc: {
    type: sequelize.STRING,
  },

});

const Lists = seq.define('lists', {
  username: {
    type: sequelize.STRING,
  },
  title: {
    type: sequelize.STRING,
  },
});

const ListItems = seq.define('listitems', {
  listid: {
    type: sequelize.INTEGER,
  },
  item: {
    type: sequelize.STRING,
  },
  value: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },
});

const Users = seq.define('users', {
  name: {
    type: sequelize.STRING,
  },
  salt: {
    type: sequelize.STRING,
  },
  password: {
    type: sequelize.STRING,
  },
}, {
  hooks: {
    beforeCreate: (user) => {
      const salt = bcrypt.genSaltSync();    //Creating a salt for the user
      const temp = bcrypt.hashSync(user.password, salt);  //Encrypting the plain pw together with the salt
      user.password = temp;
      user.salt = salt;
    },
  },
});

const CurrentUsers = seq.define('currentusers', {
  name: {
    type: sequelize.STRING,
  },
  sessionID: {
    type: sequelize.STRING,
  },
  ip: {
    type: sequelize.STRING,
  },
});


module.exports = { Users, Todos, Lists, ListItems, CurrentUsers };

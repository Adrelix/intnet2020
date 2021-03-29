/* jslint node: true */

'use strict';


const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const model = require('../model.js');
const db = require('../db.js');


const router = express.Router();
const Users = db.Users;
const CurrentUsers = db.CurrentUsers;

/**
 * requireAuth is an endpoint guard for logged in users.
 * aka: A middle ware used to limit access to an endpoint to authenticated users
 * @param {Request} req
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */


const errHandler = (err) => {
  console.log('Error: ', err);
};


const requireAuth = (req, res, next) => {
  const maybeUser = model.findUser(req.cookies.SessionID);
  // "auth" check
  if (maybeUser === undefined) {
    res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
    return;
  }
  next();
};

/**
 * Tells the client if they are in an authenticated user-session.
 * @param {String} req.sessionID - A string that uniquely identifies the given user.
 * @returns {void}
 */

router.get('/checksession', (req, res) => {
  console.log('req.session', req.session);
  console.log('req.sessionID:', req.sessionID);
  console.log('req.cookie:', req.cookies.SessionID);
  if (req.sessionID !== undefined) {
    console.log("Found a sessionID in client request")
    try {
      const user = model.findUser(req.cookies.SessionID);

      // Make sure that the request is from correct IP address.
      // This prevents that the sessionID can be stolen and used from an incorrect
      // IP address.
      if (req.connection.remoteAddress === user.ip) {
        model.updateSession(req.cookies.SessionID);
        res.status(200).json({
          user: user.name,
        });
      } else {
        // Wrong IP address made the request. Error message and error code.
        console.log('Fool me once, shame on you. Fool me twice, shame on me!');
        res.sendStatus(401);
      }
    } catch (error) {
      console.log(`Couldn't find user`);
      res.sendStatus(401);
    }
  } else {
    console.log('No sessionID found, returning to login');
    res.sendStatus(401);
  }
});

/**
 * Attempts to authenticate the user-session
 * @param {String} req.body.username - The username of the user attempting to authenticate
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.post('/authenticate', (req, res) => {
  const attemptedProfile = { name: '', salt: '', password: '' };
  async function execute() {
    // Doing a SELECT query to attempt to find a row with username
    async function findrow() {
      const fetchedData = await Users.findOne({
        where: {
          name: req.body.username,
        },
        attributes: ['name', 'salt', 'password'],
        raw: true,
      }).catch(errHandler);
      if (fetchedData !== null) { // transfering values from query if != null to attemptedprofile object
        attemptedProfile.name = fetchedData.name;
        attemptedProfile.salt = fetchedData.salt;
        attemptedProfile.password = fetchedData.password;
        await attemptlogin();
      } else {
        console.log('Profile not found in database');
        res.sendStatus(401);
      }
    }
    // Attempt login to existing profile
    async function attemptlogin() {
      console.log('Profile: ', attemptedProfile.name, 'was found');
      const hashToCompare = bcrypt.hashSync(req.body.password, attemptedProfile.salt);    //encrypt the inputted password 
      if (hashToCompare === attemptedProfile.password) {          //compares the encrypted input pw with the one in db
        console.log('Succesfull log in on profile: ', attemptedProfile.name, 'with password: ', hashToCompare);
        model.addUser(req.body.username, req.sessionID, req.connection.remoteAddress, req.session.socketID);  //Add user object to server 
        await CurrentUsers.create({ name: req.body.username, sessionID: req.sessionID, ip: req.connection.remoteAddress }).catch(errHandler);
        model.updateSession(req.sessionID);
        res.cookie('SessionID', req.sessionID);
        req.session.save((err) => {
          if (err) console.error(err);
        });
        res.sendStatus(200);
      }
      // Profile does not exist
      else {
        console.log('Wrong password, couldn\'t log in to: ', req.body.username);
        res.sendStatus(401);
      }
    }
    await findrow();
  }
  execute();
});


router.post('/register', (req, res) => {
  async function execute() {
    // Doing a SELECT query to attempt to find a row with username
    async function findrow() {
      const fetchedData = await Users.findOne({
        where: {
          name: req.body.username,
        },
        attributes: ['name'],
        raw: true,
      }).catch(errHandler);
      if (fetchedData !== null) {
        console.log('Profile with username: ', req.body.username, 'already exist');
        res.sendStatus(401);
      } else {
        console.log('Attempting to create profile: ', req.body.username);
        if (req.body.username.length < 4 || req.body.password.length < 4) {
          console.log('Password or username too short, both should be longer than 4 symbols.');
          res.sendStatus(401);
        } else {
          await createProfile();
        }
      }
    }
    // Attempt to create profile
    async function createProfile() {
      console.log('Attempting to create profile: ', req.body.username);
      await Users.create({ name: req.body.username, password: req.body.password }).catch(errHandler);
      res.sendStatus(200);
    }
    await findrow();
  }
  execute();
});


// The 'authenticate' route is only supposed to check if the user can login.

module.exports = { router, requireAuth };


//creates a random string with 256 length that works as an sessionID
async function makesessionID() {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  var length = 256;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
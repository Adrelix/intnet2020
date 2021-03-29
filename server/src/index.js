/* eslint-disable no-param-reassign */

'use strict';

// #region require dependencies
const betterLogging = require('better-logging');
// enhances log messages with timestamps etc
betterLogging.default(console, {
  stampColor: (Color) => Color.Light_Green,
  typeColors: (Color) => ({
    log: Color.Light_Green,
  }),
});


const path = require('path'); // helper library for resolving relative paths
const expressSession = require('express-session');
const socketIOSession = require('express-socket.io-session');
const express = require('express');
const https = require('https');
const database = require('./db');
const fs = require('fs');
const helmet = require('helmet');
var cookieParser = require('cookie-parser');

// #endregion

/**
 * Sync and load our sequelize databases to server
 */
const init = async () => {
  await database.Users.sync(); // force true will drop the table if it already exists
  await database.Todos.sync(); // force true will drop the table if it already exists
  await database.CurrentUsers.sync(); // force true will drop the table if it already exists

  try {
    await database.Lists.sync();
    await database.ListItems.sync();
  } catch (error) {
    console.log('Couldnt load list table');
  }
  // await database.Users.create({ name: 'kelle4', password: 'kelle4' })
  console.log('Tables have synced!');
};

init();


// #region setup boilerplate
console.loglevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 1337; // The port that the server will listen to
const app = express(); // Creates express app


// Create https server together with the required certificate, key and passphrase and express app.
const httpsServer = https.createServer({
  key: fs.readFileSync('./../key.pem'),
  cert: fs.readFileSync('./../cert.pem'),
  passphrase: 'hejsan',
}, app);

const io = require('socket.io')(httpsServer);



// Protection against xss attacks
app.use(helmet());

app.use(cookieParser());



app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true },
  path: { show: true },
  body: { show: true },
}));
app.use(express.json()); /*
This is a middleware that parses the body of the request into a javascript object.
It's basically just replacing the body property like this:
req.body = JSON.parse(req.body)
*/
app.use(express.urlencoded({ extended: true }));

// Setup session
var session = expressSession({
  key: 'user_sid',
  secret: 'verysecret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    expires: 360000,
    secure: true,
    sessionID: '',
  },
});

app.use(session);


io.use(socketIOSession(session, {
  autoSave: true,
  saveUninitialized: true,
}));
// #endregion

// Serve client
app.use(express.static(publicPath));/*
express.static(absolutePathToPublicDirectory)
This will serve static files from the public directory, starting with index.html
*/

// Bind REST controllers to /api/*
const auth = require('./rest_apis/auth.api.js');
const profile = require('./rest_apis/profile.api.js');

app.use('/api', auth.router);
// All chat endpoints require the user to be authenticated
app.use('/api', auth.requireAuth, profile.router);

const model = require('./model.js');
model.init({ io });

//Get currently logged in users
async function getCurrentUsers() {
  try {
    const fetchedUsers = await database.CurrentUsers.findAll({
      attributes: ['name', 'sessionID', 'ip'],
      raw: true,
    });


    // If we find any rows we want to create object with all information for the todo.
    if (fetchedUsers !== undefined) {

      await fetchedUsers.forEach((element) => {
        const fetchedUsers = {
          name: element.name, sessionID: element.sessionID, ip: element.ip,
        };
        console.log('Adding currentuser values:', fetchedUsers.name, fetchedUsers.sessionID, fetchedUsers.ip);
        model.addUser(fetchedUsers.name, fetchedUsers.sessionID, fetchedUsers.ip);

      });
    }
  } catch (error) {
    console.log('Error in getCurrentUsers:', error.message);
  }
}
getCurrentUsers();




// Handle connected socket.io sockets
io.on('connection', (socket) => {
  let sessionID = undefined;

  // See if the connected socket contains a sessionID and if so check if there is a coresponding
  // user object available on the server side.
  console.log('socket.sessid:', socket.handshake.cookies.SessionID);

  if (socket.handshake.cookies.SessionID && model.findUser(socket.handshake.cookies.SessionID) !== undefined) {
    console.log('Found the user');

    // Add the new socket to the user socket pool.
    model.updateUserSocket(socket.handshake.cookies.SessionID, socket);

    // Set the sessionID so we can use it when the socket gets disconnected
    sessionID = socket.handshake.cookies.SessionID;
  } else {

    // If an unknown socket connects to the server, add it to the pool of unregistered sockets and return a socketID.
    // Set sessionID to the returned socketID from addUnregisteredSocket and save the session info.
    socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
    socket.handshake.session.save((err) => {
      if (err) console.error(err);
    });
  }

  /**
   * On socket disconnect we want to remove the socket from the users socket pool.
   * First make sure that the sessionID corresponds to a user.
   * And if so then remove the socket from the users socket pool
   */
  socket.on('disconnect', () => {
    if (sessionID && model.findUser(sessionID) !== undefined) {
      model.removeSocketFromUserPool(sessionID, socket);
    }
  });
});


// Start server
httpsServer.listen(port, () => {
  console.log(`Listening on https://localhost:${port}`);
});

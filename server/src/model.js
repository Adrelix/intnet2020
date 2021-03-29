/* jslint node: true */

'use strict';

const User = require('./models/user.model');
const UserInServer = require('./models/userInServer.model');

const db = require('./db');

/**
 * users are effectively hash maps with the sessionID of the entry serving as an unique key.
 */
let users = {};
let userSessionConnection = {};
const CurrentUsers = db.CurrentUsers;


/**
 * unregisteredSockets is used as a temporary pool of sockets
 * that belonging to users who are yet to login.
 */
let nextUnregisteredSocketID = 0;
let unregisteredSockets = {};

// Will be initialized in the exports.init function
exports.io = undefined;

/**
 * Initialize the model
 * @param { { io: SocketIO.Server} } config - The configurations needed to initialize the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;
};

/**
 * Add a socket.io socket to the pool of unregistered sockets
 * @param {SocketIO.Socket} socket - The socket.io socket to add to the pool.
 * @returns {Number} The ID of the socket in the pool of unregistered sockets.
 */
exports.addUnregisteredSocket = (socket) => {
  const socketID = nextUnregisteredSocketID;
  nextUnregisteredSocketID += 1;

  unregisteredSockets[socketID] = socket;
  return socketID;
};
const assignUnregisteredSocket = (socketID) => {
  const socket = unregisteredSockets[socketID];
  unregisteredSockets = Object.keys(unregisteredSockets)
    .filter((sockID) => sockID !== socketID)
    .reduce((res, sockID) => ({ ...res, [sockID]: unregisteredSockets[sockID] }), {});

  return socket;
};


/**
 * Creates a user with the given name, sessionID and ip. 
 * And to keep track of the User objects we map them in users with the sessionID as the key. 
 * @param {String} name - The name of the user.
 * @param {String} sessionID - A sessionID which is our key in the mapping of user objects.
 * @param {String} ip - The clients ip address.
 * @param {Number} socketID - A socketID of a socket.io socket in the unregistered sockets pool.
 * @see model.addUnregisteredSocket
 * @returns {void}
 */
exports.addUser = (name, sessionID, ip, socketID) => {
  users[sessionID] = new User(name, sessionID, ip);
  if (socketID !== undefined) {
    users[sessionID].sockets.push(assignUnregisteredSocket(socketID));
    console.log('User added', name, sessionID, ip);
  }


  if (userSessionConnection[name] == undefined) {
    userSessionConnection[name] = new UserInServer(name);
  }
  userSessionConnection[name].sessionList.push(sessionID);
};

/**
 * Updated the socket associated with the user with the given name.
 * @param {String} name - The name of the user.
 * @param {SocketIO.Socket} socket - A socket.io socket.
 * @returns {void}
 */
exports.updateUserSocket = (sessionID, socket) => {
  users[sessionID].sockets.push(socket);
};

/**
 * Returns the user object with the given name.
 * @param {String} sessionID - The sessionID from request.
 * @returns {User}
 */
exports.findUser = (sessionID) => users[sessionID];

/**
 * Delete a user object from users object
 */
exports.deleteUser = (sessionID) => {
  const sockets = users[sessionID].sockets;
  emitToAllSockets(sockets, 'timeout');

  users[sessionID] = undefined;

  try {
    CurrentUsers.destroy({
      where: {
        sessionID: sessionID,
      },
    });
  } catch (err) {
    errHandler(err);
    res.sendStatus(500);
  }
};

/**
 * Remove a socket from a users socket array/pool.
 * Uses indexOf to find the index of the socket in the array.
 * And uses splice to remove the socket from the array. 
 */
exports.removeSocketFromUserPool = (sessionID, socket) => {
  users[sessionID].sockets.splice(users[sessionID].sockets.indexOf(socket), 1);
};


/**
 * An function that kicks out clients if they are idle for to long.
 * It will log out all clients that has the same sessionID. So if two tabs are open in the same browser
 * they will share sessionID resulting in that both share user object. This will result in that both tabs will
 * be kicked out when timer is reached. 
 * The timeout is set to 10 min.
 * @param {string} sessionID - A sessionID 
 */
exports.updateSession = (sessionID) => {
  console.log('updating session for user: ', users[sessionID].name);
  clearTimeout(users[sessionID].timer);

  //invalidate user object if inactive for too long
  users[sessionID].timer = setTimeout(() => {
    console.log('Kicking out user: ', users[sessionID].name);
    // Remove the user object "connected" to the sessionID
    this.deleteUser(sessionID);
    console.log('User model deleted');
  }, 600000);
};

exports.updateProfile = (sessionID) => {
  let name = users[sessionID].name;
  userSessionConnection[name].sessionList.forEach(element => {
    emitToAllSockets(users[element].sockets, 'updateProfile');
  });
};

exports.updateCheckbox = (sessionID, value, id) => {
  const sockets = users[sessionID].sockets;
  if (sockets !== undefined) {
    sockets.forEach(socket => {
      socket.emit('updateCheckbox', value, id);
    });
  }
};

/**
 * Emit a timeout message to all sockets in list.
 * @param {[sockets.io]} sockets 
 */
function emitToAllSockets(sockets, message) {
  if (sockets !== undefined) {
    console.log('sockets.length: ', sockets.length);
    sockets.forEach(socket => {
      console.log('sockets:', socket.id);

      socket.emit(message);
    });
  }
}

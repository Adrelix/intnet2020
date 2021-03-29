'use strict';

class User {
  constructor(name, sessionID, ip) {
    this.name = name;
    this.sessionID = sessionID;
    this.ip = ip;
    this.timer;
    this.sockets = [];
  }

}

module.exports = User;

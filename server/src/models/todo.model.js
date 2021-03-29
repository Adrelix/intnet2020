'use strict';

class Todo {
  constructor(username, header, desc, id) {
    this.username = username;
    this.header = header;
    this.desc = desc;
    this.id = id;
  }
}

module.exports = Todo;

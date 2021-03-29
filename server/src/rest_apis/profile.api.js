'use strict';


const express = require('express');
const db = require('../db.js');
const model = require('../model');

const { Todos, Lists, ListItems } = db;
const router = express.Router();


const errHandler = (err) => {
  console.log('Error: ', err);
};

/**
 * Router middleware that updates the user session to prevent the user from getting kicked out from idling.
 */
router.use(function (req, res, next) {
  if (req.cookies.SessionID && model.findUser(req.cookies.SessionID) !== undefined) {
    model.updateSession(req.cookies.SessionID);
    console.log('Updated session');
  }
  next();
});


/**
 * Fetches clients todos and lists from database 
 */
router.get('/getProfile', (req, res) => {
  let todos = null;
  let lists = null;
  const user = model.findUser(req.cookies.SessionID);
  async function getData() {
    try {
      todos = await getTodos(user.name);
      lists = await getLists(user.name);
      res.status(200).json({
        lists: lists,
        todos: todos,
      });
    } catch (err) {
      errHandler(err);
      console.log('error in getData');
    }
  }
  getData();
});

/**
 * This async function fetches all the user's lists. Since we have 2 tables for 1 list we first need to 
 * get all listIDs from Lists table. After that we can get all listitems foreach listID we found in the first query.
 * @param {String} username - The username of the client that made the request.
 * @returns {[Object]} - Returns an array where each element contains all information for the list.
 */
async function getLists(username) {
  let allLists = [];
  try {
    // Find all listId:s
    const fetchedLists = await Lists.findAll({
      where: {
        username: username,
      },
      attributes: ['title', 'id'],
      raw: true,
    });

    // If there are any lists then we try to find all listitems. From the first query we get all listID:s so
    // we do a query to ListItems for every listID we found.
    if (fetchedLists !== undefined) {
      for (const list of fetchedLists) {
        const listitems = [];
        const fetchedListItems = await ListItems.findAll({
          where: {
            listid: list.id,
          },
          attributes: ['item', 'id', 'value'],
          raw: true,
        });
        if (fetchedListItems !== undefined) {
          for (const item of fetchedListItems) {
            // Every listitem object contains a item name = item, a value and an id
            listitems.push({ item: item.item, value: item.value, itemid: item.id });
          }
        }

        // This is how we want the data on the client side. I.e a title, a list/array with listitem objects 
        // and a listID 
        const fetchedList = {
          title: list.title, list: listitems, id: list.id,
        };

        // Push the complete list object to allLists array. 
        allLists.push(fetchedList);
      }
      return allLists;
    }
  } catch (error) {
    errHandler(error);
    console.log('Error in getLists');
  }
}

/**
 * Gets all todos from database. The database table is really simple with attributes header, desc, owner, id
 * We query all rows where owner === username.
 * @param {String} username - The username of the client that made the request.
 * @returns {[Object]} - Returns an array with objects. Every oibjects contains all information for a todo card.
 */
async function getTodos(username) {
  const todos = [];
  try {
    const fetchedTodos = await Todos.findAll({
      where: {
        username: username,
      },
      attributes: ['username', 'header', 'desc', 'id'],
      raw: true,
    });

    // If we find any rows we want to create object with all information for the todo.
    if (fetchedTodos !== undefined) {
      await fetchedTodos.forEach((element) => {
        const fetchedTodo = {
          username: element.username, header: element.header, description: element.desc, id: element.id,
        };
        todos.push(fetchedTodo);
      });
      return todos;
    }
  } catch (error) {
    errHandler(error);
    console.log('Error in getTodos');
  }
}

router.post('/addTodo', (req, res) => {

  // Add todo card in db with username, header, description
  const user = model.findUser(req.cookies.SessionID);
  async function createTodo() {
    await Todos.create({ username: user.name, header: req.body.header, desc: req.body.description }).catch(errHandler);
    model.updateProfile(req.cookies.SessionID);
    res.sendStatus(200);
  }
  createTodo();
});

// Add list to database. 
router.post('/addList', (req, res) => {
  const user = model.findUser(req.cookies.SessionID);
  async function createList() {
    console.log('Body in addList', req.body);
    await Lists.create({ username: user.name, title: req.body.title })
      .then(function (createdRow) {
        if (req.body.list !== undefined) {
          req.body.list.forEach(async (elem) => {
            console.log('Row-ID', createdRow.get('id'));
            await ListItems.create({ listid: createdRow.get('id'), item: elem, value: false }).catch(errHandler);
          });
        }
      })
      .catch(errHandler);

    model.updateProfile(req.cookies.SessionID);
    res.sendStatus(200);
  }
  createList();
});

/**
 * Remove a todo from database and send back the now removed ID.
 */
router.post('/removeTodo', (req, res) => {
  console.log('Attempting to remove Todo with id: ', req.body.id);
  try {
    Todos.destroy({
      where: {
        id: req.body.id,
      },
    });
  } catch (err) {
    errHandler(err);
    res.sendStatus(500);
  }
  model.updateProfile(req.cookies.SessionID);
  res.status(200).json({
    id: req.body.id,
  });
});

/**
 * Remove list from database. 
 */
router.post('/removeList', (req, res) => {
  console.log('Attempting to remove Todo with id: ', req.body.id);
  try {
    Lists.destroy({
      where: {
        id: req.body.id,
      },
    });
    ListItems.destroy({
      where: {
        listid: req.body.id,
      }
    })
    model.updateProfile(req.cookies.SessionID);
    res.sendStatus(200);
  } catch (err) {
    errHandler(err);
    res.sendStatus(500);
  }
});


/**
 * Update listitem checkbox value.
 */
router.post('/checkBox', (req, res) => {
  async function updateListitem() {
    console.log('Try to change value for item', req.body);
    const row = await ListItems.findOne({ where: { listid: req.body.listid, id: req.body.id } });
    if (row !== undefined) {
      row.value = !row.value;
      await row.save();
      model.updateCheckbox(req.cookies.SessionID, row.value, req.body.id);
      res.sendStatus(200);
    }
  }
  updateListitem();
});

/**
 * Update todo info
 */
router.post('/updateTodo', (req, res) => {
  async function updateTodo() {
    const row = await Todos.findOne({ where: { id: req.body.id } });
    if (row !== undefined) {
      row.header = req.body.title;
      row.desc = req.body.desc;
      await row.save();
      model.updateProfile(req.cookies.SessionID);
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  }
  updateTodo();
});

/**
 * Logout the user. Cleartimeout so that no unwanted actions occur after.
 * Delete user object on the serverside.
 */
router.post('/logout', (req, res) => {
  console.log('Attempting to logout: ', req.cookies.SessionID);
  clearTimeout(model.findUser(req.cookies.SessionID).timer);
  model.deleteUser(req.cookies.SessionID);
  res.clearCookie('SessionID');
  res.sendStatus(200);
});


module.exports = { router };

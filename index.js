'use strict';

require('dotenv').config();
const { io } = require('socket.io-client');
const chalk = require('chalk');
const inquirer = require('inquirer');

const local = true;
const SERVER = local ? process.env.SERVER_LOCAL : process.env.SERVER_DEPLOYED;
console.log('🚀 ~ file: index.js:10 ~ SERVER', SERVER);
const socket = io(`${SERVER}/chat`);

const authPrompt = require('./src/authPrompt')(socket, SERVER);
const roomPrompt = require('./src/roomPrompt')(socket, SERVER);
const messenger = require('./src/messenger')(socket);

const session = {};

socket.on('connect', async () => {
  console.log('connected');

  const { username, rooms, zip } = await authPrompt();
  session.username = username;
  session.roomList = rooms;
  session.userZip = zip;

  session.room = await roomPrompt(session.roomList);

  socket.emit('JOIN', {
    username: session.username,
    room: session.room,
  });

  messenger();

});

socket.on('MESSAGE', payload => {
  const { username, content } = payload;
  process.stdout.moveCursor(0, -1);
  process.stdout.write('\r\x1b[k');

  console.log('\n', chalk.cyan(`${username}:`), content);
});

socket.on('RECEIVED', payload => { // string saying message received
  const { content } = payload;
  process.stdout.moveCursor(0, -1);
  process.stdout.write('\r\x1b[k');
  console.log('\n', chalk.green('Me:'), content);
});

socket.on('LEAVE', payload => {
  console.log('\n\t', chalk.magenta(payload));
});

socket.on('NEW_JOIN', payload => {
  console.log('\n\t', chalk.grey(payload));
});

socket.on('disconnect', () => {
  console.log('\n\tForcibly disconnected from server');
  process.exit();
});

socket.on('API_RESULT', payload => {
  console.log(payload);
});

#!/usr/bin/env node

'use strict';

require('dotenv').config();
const { io } = require('socket.io-client');
const chalk = require('chalk');

const SERVER = process.env.SERVER_LOCAL;

// const SERVER = 'http://notifyme.us-west-2.elasticbeanstalk.com';
console.log('🚀 ~ file: index.js:10 ~ SERVER', SERVER);
const socket = io(`${SERVER}/chat`);

const session = {};

const authPrompt = require('./src/authPrompt')(socket, SERVER);
const roomPrompt = require('./src/roomPrompt')(socket, SERVER);
const messenger = require('./src/messenger')(socket, session, roomPrompt);

socket.on('connect', async () => {
  console.log('connected');

  const { username, rooms, zip } = await authPrompt();
  session.username = username;
  session.roomList = rooms;
  session.userZip = zip;

  session.room = await roomPrompt(session.roomList);

  if(session.room === 'Commands'){
    console.log(chalk.blueBright('Welcome to Commands! Please take a look at what you can do with some of our examples.'))
  }

  if(session.room === 'Commands'){
    console.log(chalk.grey('Example Commands: \n !back - Return to Menu \n !subscribe <options : weather or events > - Subsrcibe to daily email notifcations for inputed option \n !unsubscribe <options : weather or events > - Unubsrcibe to daily email notifcations for inputed option \n !weather - Receive 5 Day forecast for your area \n !weather <Zip Code> - Receive 5 Day forecast for another zip code \n !current_weather - Receive Current weather for your area \n !current_weather <Zip Code> - Receive Current weather for another zip code \n !events <nearest major city> <two character state code> - Receive 5 events in the upcoming week for that area \n !traffic <starting address seperated by underscores> <destination address seperated by underscores> - Receive Traffic info and best route to your destination from starting point \n \n '))
  }

  if(session.room === 'General Chat'){
    console.log(chalk.greenBright('Welcome to General Chat! Here you can talk to other Travelers.'))
  }

  if(session.room === 'Questions'){
    console.log(chalk.magentaBright('Welcome to Questions! Here you ask your fellows travelers what ever questions you might have.'))
  }

  if(session.room === 'Support'){
    console.log(chalk.yellowBright('Welcome to Support! Here you can ask our wonderful support team about any questions about our application you may have.'))
  }

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

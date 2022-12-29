
const inquirer = require('inquirer');

const messengerCtor = (socket, session, roomPrompt) => (async function messenger() {
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'input',
    message: '->',
  }]);
  const { input } = answers;
  if(input === '\\q') {
    return;
  }
  process.stdout.moveCursor(0, -1);
  process.stdout.write('\r\x1b[k');
  const payload = {
    content: input,
  };

  const re = /^!(?!!)/;
  if(re.test(input)) {
    const parsed = input.match(/[\w]+/g);
    const cmd = parsed[0].toLowerCase();
    const arg = parsed.length > 1 ? parsed.slice(1) : session.userZip; // TODO replace '98034' with dynamically pulled user location
    if (cmd === 'weather') {
      socket.emit('WEATHER', { zip: arg });
    }
    if (cmd === 'current_weather') {
      socket.emit('CURRENT_WEATHER', { zip: arg });
    }
    if (cmd === 'traffic') {
      if(arg.length < 2) {
        console.log('Command requires 2 arguments');
      } else {        
        const payload = {
        firstAddress: arg[0], 
        secondAddress: arg[1],
      };
        socket.emit('TRAFFIC', payload);
      }
    }
    if (cmd === 'events') {
      if(arg.length < 2) {
        console.log('Command requires 2 arguments');
      } else {
        const payload = {
          cityName: arg[0],
          state: arg[1],
        };
        console.log(payload);
        socket.emit('EVENTS', payload);
      }
    }
    if (cmd === 'subscribe') {
      const options = ['weather', 'events'];
      if(!options.includes(arg)) {
        console.log('error: not an option for subscription');
        return messenger();
      }
      socket.emit('SUBSCRIBE', {
        username: session.username,
        type: arg,
      });
    }
    if (cmd === 'back') {
      return roomPrompt(session.roomList);
    }
  }
  socket.emit('MESSAGE', payload);
  messenger();
});

module.exports = messengerCtor;
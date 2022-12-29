
const inquirer = require('inquirer');

const messengerCtor = (socket, session) => (async function messenger() {
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
    const parsed = input.match(/[a-zA-Z0-9]+/g);
    const cmd = parsed[0].toLowerCase();
    const arg = parsed.length > 1 ? parsed[1] : session.userZip; // TODO replace '98034' with dynamically pulled user location
    if (cmd === 'weather') {
      socket.emit('WEATHER', { zip: arg });
    }
    if (cmd === 'traffic') {
      socket.emit('TRAFFIC', arg);
    }
    if (cmd === 'events') {
      socket.emit('EVENTS', arg);
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
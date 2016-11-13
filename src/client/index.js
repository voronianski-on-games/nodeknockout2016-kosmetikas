const runGame = require('./game');
const socket = require('./socket');
const userInteracions = require('./ui');

userInteracions.onPlay(username => {
  socket.emit('join-game', { username });

  socket.on('user', user => {
    console.log('render as user', user);
  });

  socket.on('enemy', enemy => {
    console.log('render as enemy', enemy);
  });

  runGame('game');
});

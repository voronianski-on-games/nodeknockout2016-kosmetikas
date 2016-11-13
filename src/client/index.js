require('babel-polyfill');

const runGame = require('./game');
const socket = require('./socket');
const userInteracions = require('./ui');

userInteracions.onPlay(username => {
  socket.emit('join-game', { username });

  socket.on('user', user => {
    runGame('game', user);
  });
});

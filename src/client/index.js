const game = require('./game');
const socket = require('./socket');
const userInteracions = require('./ui');

userInteracions.onPlay(username => {
  socket.emit('join-game', { username });

  socket.on('user', user => {
    console.log('render as user', user);
  });

  socket.on('rival', rival => {
    console.log('render as rival', rival);
  });

  socket.on('sync')

  game('game');
});

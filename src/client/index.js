const game = require('./game');
const socket = require('./socket');
const userInteracions = require('./ui');

userInteracions.onPlay(function (username) {
  socket.emit('join-game', { username });

  socket.on('user', function (user) {
    console.log('render as user', user);
  });

  socket.on('rival', function (rival) {
    console.log('render as rival', rival);
  })

  game('game');
});

const runGame = require('./game');
const socket = require('./socket');
const userInteracions = require('./ui');

userInteracions.onPlay(function (username) {
  socket.emit('new-user', { username });
  socket.on('new-user', function (user) {
    console.log(user);
  });

  console.log('Run game');
  runGame('game');
});

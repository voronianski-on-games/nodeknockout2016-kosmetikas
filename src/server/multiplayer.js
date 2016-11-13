const uuid = require('node-uuid');

const state = {
  users: []
};

function multiplayer (io) {
  io.on('connection', client => {
    client.on('join-game', data => {
      const user = Object.assign({id: uuid.v4()}, data);

      state.users.push(user);

      client.emit('user', user);
      client.broadcast.emit('enemy', user);
    });
  });
}

module.exports = multiplayer;

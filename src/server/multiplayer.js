const uuid = require('node-uuid');

const state = {
  users: []
};

function multiplayer (io) {
  io.on('connection', client => {
    client.on('join-game', user => {
      const newUser = Object.assign({id: uuid.v4()}, user);

      state.users.push(newUser);

      client.emit('user', newUser);
      client.broadcast.emit('rival', newUser);
    });
  });
}

module.exports = multiplayer;

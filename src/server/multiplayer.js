const uuid = require('node-uuid');

const state = {
  users: []
};

function multiplayer (io) {
  io.on('connection', client => {
    let user;

    client.on('join-game', data => {
      user = Object.assign({id: uuid.v4()}, data);

      user.x = Math.random() * 100;
      user.y = Math.random() * 100;

      state.users.push(user);

      client.emit('user', user);
      io.emit('sync', state.users);
    });

    client.on('sync', data => {
      if (user) {
        user.x = data.x;
        user.y = data.y;
        user.rotation = data.rotation;
        // console.log(state.users);
        client.broadcast.emit('sync', state.users);
      }
    });

    client.on('disconnect', function() {
      if (user) {
        state.users = state.users.filter(u => u.id !== user.id);
        console.log(user.username, 'left');
        console.log('Current users:', state.users);
        io.emit('left-game', user);
      }
    });
  });
}

module.exports = multiplayer;

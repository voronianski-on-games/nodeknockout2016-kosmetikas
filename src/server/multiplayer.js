const uuid = require('node-uuid');

const state = {
  users: [],
  bullets: []
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
      io.emit('sync', state);
    });

    client.on('sync', data => {
      if (user) {
        user.x = data.x;
        user.y = data.y;
        user.rotation = data.rotation;
        // console.log(state.users);
        client.broadcast.emit('sync', state);
      }
    });

    client.on('shoot', data => {
      data.bullet.id = uuid.v4();
      data.bullet.t = Date.now();
      state.bullets.push(data.bullet);
      client.broadcast.emit('sync', state);
    });

    client.on('disconnect', () => {
      if (user) {
        state.users = state.users.filter(u => u.id !== user.id);
        console.log(user.username, 'left');
        console.log('Current users:', state.users);
        io.emit('left-game', user);
      }
    });
  });

  // Game loop
  setInterval(() => {
    const now = Date.now();
    state.bullets = state.bullets.filter(b => b.t + 2500 >  now);
    for (let bullet of state.bullets) {
      bullet.x += 10 * Math.cos(bullet.rotation);
      bullet.y += 10 * Math.sin(bullet.rotation);
    }

    io.emit('sync', state);
  }, 30);
}

module.exports = multiplayer;

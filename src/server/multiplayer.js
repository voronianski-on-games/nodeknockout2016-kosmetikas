const uuid = require('node-uuid');
const gameloop = require('node-gameloop');

const BULLET_LIFETIME = 2500;
const BULLET_SPEED = 400;
const REFRESH_RATE = 1000 / 30;

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

  // start the loop at 30 fps (1000/30ms per frame)
  gameloop.setGameLoop(delta => {
    const now = Date.now();

    state.bullets = state.bullets.filter(b => b.t + BULLET_LIFETIME > now);

    const speed = BULLET_SPEED * delta;

    for (let bullet of state.bullets) {
      bullet.x += speed * Math.cos(bullet.rotation);
      bullet.y += speed * Math.sin(bullet.rotation);
    }

    io.emit('sync', state);
  }, REFRESH_RATE);
}

module.exports = multiplayer;

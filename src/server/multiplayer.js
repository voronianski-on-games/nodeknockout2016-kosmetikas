const uuid = require('node-uuid');
const gameloop = require('node-gameloop');

const BULLET_LIFETIME = 2500;
const BULLET_SPEED = 400;
const REFRESH_RATE = 1000 / 30; // 30 fps (1000/30ms per frame)
const SPRITE_SIZE = 16;
const RESPAWN_TIME = 3000;

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
      user.health = 3;

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
        // client.broadcast.emit('sync', state);
      }
    });

    client.on('shoot', bullet => {
      if (user) {
        bullet.id = uuid.v4();
        bullet.t = Date.now();
        bullet.owner = user;
        state.bullets.push(bullet);
      }
      // client.broadcast.emit('sync', state);
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

  // start the loop
  gameloop.setGameLoop(delta => {
    const now = Date.now();
    const speed = BULLET_SPEED * delta;

    // clean dead bullets
    state.bullets = state.bullets.filter(b => !b.dead && (b.t + BULLET_LIFETIME*2 > now));

    // respwn dead users
    const deadUsers = state.users.filter(u => !u.dead);
    for (let du of deadUsers) {
      if (du.deathTime + RESPAWN_TIME < now) {
        du.dead = false;
        du.health = 3;
        io.emit('respawn', du);
      }
    }

    for (let b of state.bullets) {
      b.x += speed * Math.cos(b.rotation);
      b.y += speed * Math.sin(b.rotation);

      // detect collisions
      for (let u of state.users) {
        if (u.id === b.owner.id) {
          continue;
        }
        if (b.x < u.x + SPRITE_SIZE && b.x + SPRITE_SIZE > u.x
          && b.y < u.y + SPRITE_SIZE && SPRITE_SIZE + b.y > u.y) {
          u.health -= 1;
          b.dead = true;
          io.emit('collision', {bullet: b, user: u}); // not used
        }
        if (!u.dead && u.health <= 0) {
          u.dead = true;
          u.deathTime = now;
          io.emit('death', u);
        }
      }

      if (b.t + BULLET_LIFETIME < now) {
        b.dead = true;
      }
    }

    io.emit('sync', state);
  }, REFRESH_RATE);
}

module.exports = multiplayer;

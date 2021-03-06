const socket = require('./socket');

function runGame (elementId, user, onDestroy) {
  const game = new Phaser.Game('100%', '100%', Phaser.CANVAS, elementId, { create, update, preload }, true);
  let state = {
    users: [],
    bullets: []
  };

  let player;
  let weapon;
  let enemies = [];
  let bullets = [];
  let cursors;
  let fireButton;
  let starfield;
  let health;

  function createShipGraphics (type) {
    // Create our bitmapData which we'll use as a Sprite texture for the ship
    const shipBMD = game.add.bitmapData(32, 32);
    const isEnemy = (type === 'enemy');

    shipBMD.context.strokeStyle = 'white';
    shipBMD.context.lineWidth = 2;
    shipBMD.context.fillStyle = isEnemy ? '#FC5130' : 'black';
    shipBMD.context.beginPath();
    shipBMD.context.moveTo(0, 4);
    shipBMD.context.lineTo(32, 16);
    shipBMD.context.lineTo(0, 28);
    shipBMD.context.lineTo(6, 16);
    shipBMD.context.closePath();
    shipBMD.context.fill();
    shipBMD.context.stroke();

    game.cache.addBitmapData(`${type}Ship`, shipBMD);
  }

  function createBulletGraphics () {
    // Create our bitmapData which we'll use as a Sprite texture for the bullets
    const bulletBMD = game.add.bitmapData(32, 32);

    bulletBMD.context.strokeStyle ='white';
    bulletBMD.context.fillStyle ='white';
    bulletBMD.context.fillRect(10, 15, 32, 2);

    game.cache.addBitmapData('bullet', bulletBMD);
  }

  function setHealth(n) {
    health.removeAll();

    for (let i=0; i < n; i++) {
      const hSprite = health.create(70 + i*35, 36, game.cache.getBitmapData('userShip'));
      hSprite.angle = -90;
      hSprite.scale.setTo(0.6, 0.6);
    }
  }

  function createPlayer(user) {
    const player = game.add.sprite(user.x, user.y, game.cache.getBitmapData('userShip'));

    // follow player
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON);

    player.anchor.set(0.5);

    game.physics.arcade.enable(player);

    player.body.drag.set(70);
    player.body.maxVelocity.set(200);
    player.body.collideWorldBounds = true;
    player.body.bounce.setTo(0.9, 0.9);

    //  Tell the Weapon to track the 'player' Sprite
    //  With small offset from the position
    //  'true' argument tells the weapon to track player rotation
    weapon.trackSprite(player, 8, 0, true);

    setHealth(user.health);

    return player;
  }

  function preload () {
    // fullscreen and resizable
    game.load.image('starfield', '/assets/stars-bg.png');
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.stage.disableVisibilityChange = true;
    game.raf = new Phaser.RequestAnimationFrame(game, true);

    createShipGraphics('user');
    createShipGraphics('enemy');
    createBulletGraphics();
  }

  function create() {
    game.world.setBounds(-1000, -1000, 2000, 2000);
    starfield = game.add.tileSprite(-1000, -1000, 2000, 2000, 'starfield');

    // Creates 30 bullets, using the 'bullet' graphic
    weapon = game.add.weapon(30, game.cache.getBitmapData('bullet'));

    // The bullets will be automatically killed when they are 2.5s old
    weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    weapon.bulletLifespan = 10;

    //  The speed at which the bullet is fired
    weapon.bulletSpeed = 400;

    // TODO: Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    weapon.fireRate = 200;

    //  Wrap bullets around the world bounds to the opposite side
    // weapon.bulletWorldWrap = true;

    // create "healthbar"
    health = game.add.group();
    health.fixedToCamera = true;
    health.cameraOffset = new Phaser.Point(0, 0);

    player = createPlayer(user);

    // Controls setup
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
  }

  function update() {
    if (player) {
      if (cursors.up.isDown) {
        // move background
        const r = Math.floor(player.rotation);

        if (r === 2) {
          starfield.tilePosition.x -= 1;
        }
        if (r === -1) {
          starfield.tilePosition.x += 1;
        }
        if (r === 1) {
          starfield.tilePosition.y -= 1;
        }
        if (r === -2) {
          starfield.tilePosition.y += 1;
        }

        game.physics.arcade.accelerationFromRotation(player.rotation, 300, player.body.acceleration);
      } else if (cursors.down.isDown) {
        game.physics.arcade.accelerationFromRotation(player.rotation, -150, player.body.acceleration);
      } else {
        player.body.acceleration.set(0);
      }

      if (cursors.left.isDown) {
        player.body.angularVelocity = -300;
      } else if (cursors.right.isDown) {
        player.body.angularVelocity = 300;
      } else {
        player.body.angularVelocity = 0;
      }

      if (fireButton.isDown) {
        let bullet = weapon.fire();
        if (bullet) {
          let data = {
            x: bullet.x,
            y: bullet.y,
            rotation: bullet.rotation
          };
          socket.emit('shoot', data);
        }
      }

      user.x = player.x;
      user.y = player.y;
      user.rotation = player.rotation;

      socket.emit('sync', user);
    }

    for (let u of state.users) {
      if (u.id !== user.id && !u.dead) { // don't update users location and dead enemies
        let enemy = enemies.find(e => e.id === u.id);

        if (!enemy) {
          // new enemy appeared - render him
          enemy = game.add.group();
          enemy.x = u.x;
          enemy.y = u.y;
          let enemySprite = game.add.sprite(0, 0, game.cache.getBitmapData('enemyShip'));
          enemySprite.anchor.set(0.5);
          enemy.add(enemySprite);
          let text = game.add.text(0, 18, u.username, { font: '11px Roboto, Helvetica, sans-serif', fill: '#fff', align: 'center', fontWeight: '300' });
          enemy.add(text);

          enemy.id = u.id;
          enemies.push(enemy);
        } else {
          // change position of the existing one
          enemy.x = u.x;
          enemy.y = u.y;
          enemy.children[0].rotation = u.rotation;
        }
      } else if (u.id === user.id) {
        if (health.length !== u.health) {
          setHealth(u.health);
        }
      }
    }

    for (let b of state.bullets) {
      if (b.dead) {
        // remove dead bullets
        const bulletIndex = bullets.findIndex(bs => bs.id === b.id);
        if (bulletIndex > -1) {
          bullets[bulletIndex].destroy();
          bullets.splice(bulletIndex, 1);
        }
        continue;
      }
      let bullet = bullets.find(bu => bu.id === b.id);
      if (!bullet) {
        // new bullet appered - render it
        bullet = game.add.sprite(b.x, b.y, game.cache.getBitmapData('bullet'));
        bullet.anchor.set(0.5);
        bullet.rotation = b.rotation;
        bullet.id = b.id;
        bullets.push(bullet);
      } else {
        // change position of the existing one
        bullet.x = b.x;
        bullet.y = b.y;
      }
    }
  }

  // multiplayer events
  socket.on('sync', st => {
    state = st;
  });

  socket.on('left-game', u => {
    const enemyIndex = enemies.findIndex(e => e.id === u.id);

    if (enemyIndex > -1) {
      enemies[enemyIndex].destroy();
      enemies.splice(enemyIndex, 1);
    }
  });

  socket.on('death', u => {
    if (u.id === user.id) {
      // player died
      player.destroy();
      player = null;
      onDestroy && onDestroy();
    } else {
      // enemy died
      const enemyIndex = enemies.findIndex(e => e.id === u.id);

      if (enemyIndex > -1) {
        enemies[enemyIndex].destroy();
        enemies.splice(enemyIndex, 1);
      }
    }
  });

  socket.on('respawn', u => {
    if (u.id === user.id) {
      player = createPlayer(u);
    }
  });

  return game;
}

module.exports = runGame;

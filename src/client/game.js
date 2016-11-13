const socket = require('./socket');

function runGame (elementId, user) {
  const game = new Phaser.Game('100%', '100%', Phaser.CANVAS, elementId, { create, update, preload });
  let state = {
    users: []
  };

  let player;
  let weapon;
  let enemies = [];
  let cursors;
  let fireButton;

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
    bulletBMD.context.fillRect(0, 6, 32, 2);
    bulletBMD.context.fillRect(0, 24, 32, 2);

    game.cache.addBitmapData('bullet', bulletBMD);
  }

  function preload () {
    // fullscreen and resizable
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
  }

  function create() {
    game.stage.disableVisibilityChange = true; // TODO: remove in prod
    game.world.setBounds(-1000, -1000, 2000, 2000);
    game.add.text(0, 0, 'PREPARE\nFOR BATTLE', { font: '32px Arial', fill: '#5ce6cd', align: 'center' });

    createShipGraphics('user');
    createShipGraphics('enemy');
    createBulletGraphics();

    // Creates 30 bullets, using the 'bullet' graphic
    weapon = game.add.weapon(30, game.cache.getBitmapData('bullet'));

    // The bullets will be automatically killed when they are 2.5s old
    weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
    weapon.bulletLifespan = 2500;

    //  The speed at which the bullet is fired
    weapon.bulletSpeed = 400;

    // TODO: Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    weapon.fireRate = 200;

    //  Wrap bullets around the world bounds to the opposite side
    weapon.bulletWorldWrap = true;

    player = game.add.sprite(user.x, user.y, game.cache.getBitmapData('userShip'));

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

    // Controls setup
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
  }

  function update() {

    if (cursors.up.isDown) {
      game.physics.arcade.accelerationFromRotation(player.rotation, 300, player.body.acceleration);
    } else {
      player.body.acceleration.set(0);
    }

    // TODO: pressing down to stop / fly in reverse?

    if (cursors.left.isDown) {
      player.body.angularVelocity = -300;
    } else if (cursors.right.isDown) {
      player.body.angularVelocity = 300;
    } else {
      player.body.angularVelocity = 0;
    }

    if (fireButton.isDown) {
      weapon.fire();
    }

    // game.world.wrap(player, 16);

    for (let u of state.users) {
      if (u.id !== user.id) { // don't update users location
        let enemy = enemies.find(e => e.id === u.id);
        if (!enemy) {
          // new enemy appered - render him
          enemy = game.add.sprite(u.x, u.y, game.cache.getBitmapData('enemyShip'));
          enemy.anchor.set(0.5);
          enemy.id = u.id;
          enemies.push(enemy);
        } else {
          // change position of the existing one
          enemy.x = u.x;
          enemy.y = u.y;
          enemy.rotation = u.rotation;
        }
      }
    }

    user.x = player.x;
    user.y = player.y;
    user.rotation = player.rotation;

    socket.emit('sync', user);
  }

  // multiplayer

  socket.on('sync', st => {
    state = st;
  });

  return game;
}

module.exports = runGame;

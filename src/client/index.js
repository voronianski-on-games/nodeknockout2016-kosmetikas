const runGame = require('./game');
const introAudio = new Audio('./assets/adropday-the_cougar.mp3');
// const gameAudio = new Audio('./assets/uoki-toki-king_of_my_castle.mp3'); // use it when game starts

introAudio.play();
introAudio.addEventListener('ended', function () {
  introAudio.currentTime = 0;
  introAudio.play();
}, false);

const $playForm = document.getElementById('playForm');
const $username = document.getElementById('username');

$playForm.onsubmit = function (e) {
  e.preventDefault();

  const username = $username.value;

  if (!username) {
    $playForm.classList.add('shake');
    setTimeout(function () {
      $playForm.classList.remove('shake');
    }, 1000);
    return;
  }

  introAudio.pause();
  introAudio.currentTime = 0;

  console.log('Game will start here with ' + username + '!');
};

runGame('game');

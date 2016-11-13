const store = require('store');

const cachedSound = store.get('soundEnabled');
let soundEnabled = typeof cachedSound !== 'boolean' ? true : cachedSound;
let onPlayCallback = function noop () {};

// elements
const $intro = document.getElementById('intro');
const $noSound = document.getElementById('noSound');
const $playForm = document.getElementById('playForm');
const $username = document.getElementById('username');

// audio
const audio = document.createElement('audio');
const introAudio = './assets/adropday-the_cougar.mp3';
const gameAudio = './assets/adropday-hotline_ berlin.mp3';

audio.src = introAudio;
if (soundEnabled) {
  audio.play();
} else {
  $noSound.classList.add('active');
}
// loop audio
audio.addEventListener('ended', function () {
  audio.currentTime = 0;
  audio.play();
}, false);

// username form submit
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

  if (soundEnabled) {
    audio.pause();
    audio.src = gameAudio
    audio.play();
  }

  $intro.classList.add('turn-off');
  setTimeout(function () {
    $intro.style.display = 'none';
    onPlayCallback(username);
  }, 500);
};

// toggle audio
$noSound.onclick = function (e) {
  e.preventDefault();

  soundEnabled = !soundEnabled;
  store.set('soundEnabled', soundEnabled);

  if (soundEnabled) {
    $noSound.classList.remove('active');
    audio.play();
  } else {
    $noSound.classList.add('active');
    audio.pause();
  }
};

exports.onPlay = function (callback) {
  onPlayCallback = callback;
};

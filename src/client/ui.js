const store = require('store');

const cachedSound = store.get('soundEnabled');
let gameStarted = false;
let soundEnabled = typeof cachedSound !== 'boolean' ? true : cachedSound;
let onPlayCallback = function noop () {};

// elements
const $intro = document.getElementById('intro');
const $noSound = document.getElementById('noSound');
const $playForm = document.getElementById('playForm');
const $username = document.getElementById('username');
const $hint = document.getElementById('hint');

// audio
const audio = document.createElement('audio');
const introAudio = './assets/adropday-the_cougar.mp3';
const gameAudios = [
  './assets/adropday-hotline_berlin.mp3',
  './assets/adropday-80s_all_over_again.mp3',
  './assets/uoki-toki-king_of_my_castle.mp3'
];
const randomGameAudioIndex = Math.floor(Math.random() * gameAudios.length);
const gameAudio = gameAudios[randomGameAudioIndex];

audio.src = introAudio;
if (soundEnabled) {
  audio.play();
} else {
  $noSound.classList.add('active');
}
// loop audio
audio.addEventListener('ended', () => {
  audio.currentTime = 0;
  audio.play();
}, false);

// username form submit
$playForm.onsubmit = e => {
  e.preventDefault();

  const username = $username.value;

  if (!username) {
    $playForm.classList.add('shake');
    setTimeout(() => {
      $playForm.classList.remove('shake');
    }, 1000);
    return;
  }

  soundEnabled && audio.pause();
  audio.src = gameAudio;
  soundEnabled && audio.play();

  $intro.classList.add('turn-off');
  setTimeout(() => {
    $intro.style.display = 'none';
    $hint.style.display = 'block';

    onPlayCallback(username);

    setTimeout(() => {
      $hint.classList.add('fadeOutDown');
    }, 3000);
  }, 500);
};

// toggle audio
$noSound.onclick = e => {
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

exports.onPlay = callback => {
  onPlayCallback = callback;
};

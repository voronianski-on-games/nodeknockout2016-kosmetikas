const $playForm = document.getElementById('playForm');
const $username = document.getElementById('username');

$playForm.onsubmit = e => {
  e.preventDefault();

  const username = $username.value;

  if (!username) {
    $playForm.classList.add('shake');
    setTimeout(() => $playForm.classList.remove('shake'), 1000);
    return;
  }

  console.log('Game will start here with ' + username + '!');
};


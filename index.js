const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.send('Hello from Node Knockout 2016 Asteroids on Steroids game!');
});

app.listen(app.get('port'), () => {
  console.log('Node app is running at http://localhost:' + app.get('port'))
});

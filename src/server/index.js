const path = require('path');
const swig = require('swig');
const express = require('express');
const logger = require('morgan');
const serveBase = require('./middlewares/serveBase');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, './views'));

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', serveBase());

io.on('connection', client => {
  console.log('user connected');
  client.on('join-game', user => {
    console.log(user);
    client.emit('user', user);
    client.broadcast.emit('rival', user);
  });
});

http.listen(app.get('port'), () => {
  console.log('Node app is running at http://localhost:' + app.get('port'));
});

const path = require('path');
const swig = require('swig');
const express = require('express');
const logger = require('morgan');

const app = express();

app.set('port', (process.env.PORT || 5000));

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, './views'));

app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('base');
});

app.listen(app.get('port'), () => {
  console.log('Node app is running at http://localhost:' + app.get('port'))
});

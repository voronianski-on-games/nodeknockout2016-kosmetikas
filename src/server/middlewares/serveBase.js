const env = process.env.NODE_ENV || 'development';
const versionifyAssets = require('versionify-assets');

function handler (title, mainJS, mainCSS) {
  return (req, res) => {
    res.render('base', {title, mainJS, mainCSS});
  };
}

module.exports = function serveClient () {
  if ('production' === env) {
    return handler(
      'Asteroids on Steroids (NKO16 Entry)',
      versionifyAssets('/build/bundle.min.js'),
      versionifyAssets('/build/bundle.min.css')
    );
  } else {
    return handler(
      'Asteroids on Steroids (NKO16 Entry) | Dev',
      '/build/bundle.js',
      '/build/bundle.css'
    );
  }
}

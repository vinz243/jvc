var util = require('util'),
  colors = require('colors'),
  http = require('http'),
  httpProxy = require('http-proxy'),
  connect = require('connect')

var welcome = [
  '#    # ##### ##### #####        #####  #####   ####  #    # #   #',
  '#    #   #     #   #    #       #    # #    # #    #  #  #   # # ',
  '######   #     #   #    # ##### #    # #    # #    #   ##     #  ',
  '#    #   #     #   #####        #####  #####  #    #   ##     #  ',
  '#    #   #     #   #            #      #   #  #    #  #  #    #  ',
  '#    #   #     #   #            #      #    #  ####  #    #   #  '
].join('\n');

util.puts(welcome.rainbow.bold);

//
// Basic Http Proxy Server
//
proxy = httpProxy.createServer({
  target: 'http://ws.jeuxvideo.com/'
});

timers = {}

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  timers[req.method + ' ' + req.url] = Date.now()
  proxyReq.setHeader('Host', 'ws.jeuxvideo.com');
  proxyReq.setHeader('Cookie', 'wenvjgol=' + cookie)
});
proxy.on('error', function(e) {
  console.log(e);
});
var cookie = undefined
proxy.on('proxyRes', function(proxyRes, req, res) {
  console.log(req.method.green +
    ' ' + req.url.cyan + ' - ' + (proxyRes.statusCode + "")[((proxyRes.statusCode +
      "")[
      0] - 0 > 3) ? "red" : "green"] + ' - ' + (Date.now() - timers[req.method +
      ' ' +
      req.url]) +
    ' ms\t (' + cookie + ')');


});
connect.createServer(
  function(req, res, next) {
    if (req.url === '/mon_compte/connexion.php') {
      res.oldWrite = res.write;

      var body = ""
      res.write = function(data) {
        /* add logic for your data here */
        body = data.toString('UTF8')
        cookie = (/<cookie><!\[CDATA\[wenvjgol=(.+)\]\]><\/cookie>/g.exec(
          body) || ["", undefined])[1]
        res.oldWrite(data);

      }
    }
    res.setHeader('Access-Control-Allow-Origin', 'http://172.16.0.9:8100');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers',
      'Content-Type, Authorization');
    console.log('setting cookie 2 ')
    if (cookie) {
      res.setHeader('Set-Cookie', 'wenvjgol=' + cookie +
        '; Domain=localhost:8101; Path=/; Expires=' + new Date(Date.now() +
          1000 * 3600 * 24).toUTCString())
    }
    next();
  },
  function(req, res) {
    if (req.method === "OPTIONS") {
      res.end();
      return;
    }
    proxy.web(req, res);
  }
).listen(8101);

util.puts('http proxy server'.blue + ' started '.green.bold + 'on port '.blue +
  '8001'.yellow);

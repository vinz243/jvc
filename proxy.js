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
  target :'http://ws.jeuxvideo.com/'
});


proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('Host', 'ws.jeuxvideo.com');
});
proxy.on('error', function(e) {
 console.log(e);
});
connect.createServer(
  function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  },
  function (req, res) {
    if(req.method == "OPTIONS") {
      res.end();
      return;
    }
    console.log(req.method, req.url);
    proxy.web(req, res);
  }
).listen(8101);

util.puts('http proxy server'.blue + ' started '.green.bold + 'on port '.blue + '8001'.yellow);

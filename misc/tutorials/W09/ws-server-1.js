var G_port = 20267; /* change this!! */

var fs = require("fs");
var http = require("http");
var os = require("os");
var ws = require("ws"); // npm install ws

function serveApp(request, response) {
  fs.readFile(__dirname + "/index.html",
  function (error, data) {
    if (error) {
      response.writeHead(500);
      response.end("Error loading index.html");
    }
    else {
      response.writeHead(200, {"Content-Type": "text/html"});
      response.end(data);
    }
  });
}

var httpServer = http.createServer(serveApp).listen(G_port, os.hostname());
var wsServer = new ws.Server({server: httpServer});
var wsList = []; // all connected clients

wsServer.on("connection", function(ws) {

  wsList.push(ws);

  console.log("-- connection: " + wsList.length);

  ws.on("close", function(code, message) {
    var i = wsList.indexOf(this);
    wsList[i] = null;
    for(var n = i; n < wsList.length; ++n) {
      // close hole in array
      wsList[n] = wsList[n + 1];
    }
    --wsList.length;
    console.log("-- disconnected: " + (i + 1));
  });

  ws.on("message", function(data) {
    var message = data.toString();
    console.log("-- client: " + message);
    for(var i = 0; i < wsList.length; ++i) {
      if (wsList[i] != this) { wsList[i].send(message); }
    }
  });

});

console.log("-- server is running: " + os.hostname() + ":" + G_port);

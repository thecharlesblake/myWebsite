/* trivial web server */

var dns = require("dns"); // https://nodejs.org/api/dns.html
var http = require("http"); // https://nodejs.org/api/http.html
var os = require("os"); // https://nodejs.org/api/os.html
var process = require("process"); // https://nodejs.org/api/process.html

function reply(request, response) {
  // https://nodejs.org/api/net.html#net_class_net_socket
  console.log("Replying to "
              + request.socket.remoteAddress
              + ":"
              + request.socket.remotePort);

  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World!\n");
}

function startup(error, address, family) {
  var server = http.createServer(reply);
  server.listen(myPort, address);
  console.log(hostname + " (" + address + ") : " + myPort);
}

var myPort = process.getuid(); /** type "id" on Linux for uid value **/
if (myPort < 1024) myPort += 10000; // do not use privileged ports
hostname = os.hostname();
dns.lookup(hostname, 4, startup);

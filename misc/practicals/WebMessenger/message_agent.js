var fs = require("fs");
var http = require("http");
var path = require("path");
var url = require("url");
var linereader = require("line-by-line");
var ws = require("ws");
var dns = require("dns");
var net = require("net");
var os = require("os");
var process = require("process");
var readline = require("readline");

var G_ui_port = process.argv[2];
var G_ma_Port = process.argv[3];

var G_css = "/message.css";
var G_html = "/message.html";
var G_js_client = "/message-client.js";
var G_conversation_history = "conversation_history.txt";

var G_classFile = "web2-users.txt";
var G_classList = {};

var G_messageCache = {};

var G_files = {};
G_files[G_css] = {"name": G_css, "type": "text/css"};
G_files[G_html] = {"name": G_html, "type": "text/html"};
G_files[G_js_client] = {"name": G_js_client, "type": "text/javascript"};

var G_maHost = {}; // an object which maps fields containing IP address to sub-objects which contain the key-value pairs "port","hostname","client" (a socket)

var wsUI; // the UI websocket

//////////////
// MA Setup //
//////////////

dns.lookup(os.hostname(), 4, maStartup);

// create a server object for the MA and store its info in a global variable
var G_maServer = net.createServer(function (socket) {

    socket.on("error", function (e) {
        console.log("-- MA socket error: " + e);
    });

    // finds the hostname corresponding to the remote port and uses that
    // as a key for the client connection

    G_maHost[socket.remoteAddress] = {"hostname": "", "port": socket.remotePort, "client": socket};
    setUpMASocket(socket);
    console.log("-- MA connected to host MA (" + socket.remoteAddress + ")");
});

// attempt to make the MA server listen on the specified port
function maStartup(error, address, family) {
    if (error != null && error.code != 0) {
        console.log("error! " + error);
    }
    else {
        G_maServer.listen(G_ma_Port, address);
        console.log("-- MA server running at: "
                + os.hostname() + ":" + G_ma_Port);
    }
}

// called when the MA server is set up. This specifies how the MA reacts to incoming data (from other MAs)
function setUpMASocket(socket) {

    socket.on("data", function (line) {
        var inObj = JSON.parse(line);

        // if we don't yet know the hostname of the sender we can now work it out from the incoming packet
        if (G_maHost[socket.remoteAddress]["hostname"] == "") {
            G_maHost[socket.remoteAddress]["hostname"] = inObj["payload"]["sender"];
            console.log("-- MA identified IP " + this.remoteAddress + " as " + inObj["payload"]["sender"]);
        }

        console.log("-- MA revceived from host MA (" + G_maHost[socket.remoteAddress]["hostname"] + ") packet: " + line);


        switch (inObj["type"]) {

            // in the case of an agent message, we will update the fields of the
            // incoming object and send it to the UI, then send a confirmation to the host MA
            case "agent_message":
                {
                    var timestamp = Date.now();
                    //
                    // forward altered message to UI
                    //
                    var uiObj = JSON.parse(line);

                    // change the fields as required
                    delete uiObj["payload"]["receiver"];
                    uiObj["payload"]["timestamp"] = timestamp;

                    var outString = JSON.stringify(uiObj);

                    console.log("-- MA sent packet to UI: " + outString);
                    if (wsUI != null)
                        wsUI.send(outString);

                    // add the message to the conversation history
                    addToHistory(outString);

                    //
                    // send a confirmation back to the host MA
                    //
                    var responseObj = JSON.parse(line);

                    // change the fields as required
                    delete responseObj["payload"]["text"];
                    responseObj["type"] = "delivery";
                    responseObj["payload"]["timestamp"] = timestamp;
                    responseObj["payload"]["success"] = true;

                    var responseString = JSON.stringify(responseObj);

                    console.log("-- MA sent success confirmation to host MA: " + responseString);
                    socket.write(responseString)
                }
                break;

                // if we are receiving a delivery message then we remove that message's id
                // from the array of messages we are waiting for, then forward the delivery
                // message to the UI unaltered
            case "delivery":
                {
                    // add the message to the conversation history
                    addToHistory(G_messageCache[inObj["payload"]["id"]]);

                    // remove the message's ID from the array of awaiting responses
                    delete G_messageCache[inObj["payload"]["id"]];

                    // send a packet to the UI to indicate successful delivery
                    if (wsUI != null)
                        wsUI.send(line.toString());
                }
                break;

            default:
                console.log("-- MA received from MA unknown packet type: " + inObj["type"]);
        }

        ;
    });

    socket.on("end", function () {
        var hostKey = getKeyFromSocket(this);
        var hostname = G_maHost[hostKey]["hostname"];
        console.log("-- host MA (" + (hostname == null ? hostKey : hostname) + ") Disconnected.");
        clearMAHost(hostKey);
    });
}

function addToHistory(jsonString) {
    fs.appendFile(G_conversation_history, jsonString + "|");
}

function getKeyFromSocket(socket) {
    for (var key in G_maHost) {
        if (G_maHost[key]["client"] == socket) {
            return key;
        }
    }
    return null;
}

function clearMAHost(hostKey) {
    delete G_maHost[hostKey];
}

//////////////
// UI Setup //
//////////////

// create a websocket connection for the UI to connect to
var httpUIServer = http.createServer(serveApp).listen(G_ui_port, os.hostname());

// defines how files are sent to the browser via HTTP
function serveApp(request, response) {
    var pathname = url.parse(request.url)["pathname"];

    console.log("-- UI request for: " + pathname);
    switch (pathname) {

        case "/":
            pathname = G_html;
            break;

        case G_css:
        case G_html:
        case G_js_client:
            /* all fine - nothing else to do */
            break;

        default:
            /* for any requests other than known files */
            pathname = G_html;
            break;
    }

    // if the file requested is G_html, generate the page using javascript and return it
    if (pathname == G_html) {
        response.writeHead(200, "text/plain");
        generateUIPage(response);
    }

    // otherwise read the requested page from file and return it
    else {
        var filename = path.join(__dirname, pathname);
        fs.readFile(filename, function (error, file) {
            /* code missing - should handle errors also! */
            response.writeHead(200, G_files[pathname].type);
            response.write(file);
            response.end();
        });
    }
}

// creates a websocket on top of the http connection for full duplex communication
var wsUIServer = new ws.Server({server: httpUIServer});
console.log("-- UI server running at: " + os.hostname() + ":" + G_ui_port);

// set up how the UI websocket should respond incomming messages and how it closes
wsUIServer.on("connection", function (ws) {

    ws.on("message", function (data) {
        console.log("-- MA received UI websocket packet: " + data);
        var packet = JSON.parse(data);

        switch (packet["type"]) {

            // if we recieve a client message from the UI, forward it to the relevant method
            case "client_message":
                handleUIPacket(data);
                break;

                // otherwise log an error
            default:
                console.log("-- unknown message type: " + packet["type"]);
                break;
        }
    });

    ws.on("close", function (code, message) {
        wsUI = null;
        G_maHost = {}; // close all tcp client connections
        console.log("-- UI websocket disconnected");
    });

    ws.hello = false; // waiting for "hello" from user
    ws.handle = "";
    wsUI = ws;

    console.log("-- UI websocket connection");

    // sends the last 10 messages in the conversation history to the UI
    fs.readFile(G_conversation_history, 'utf8', function (err, data) {
        var last10msgs = data.split("|");
        
        for (var i = 0; i < 10; i++) {
            msg = last10msgs[last10msgs.length - 10 + i];
            if (wsUI != null && msg != null) wsUI.send(msg);
        }
    });
});

// communicates between the UI and MA parts of the program. Essentially when a message is
// received from the UI websocket, the TCP MA alters it and forwards it. If we are not
// yet connected to the recipient, attempt the connection here
function handleUIPacket(packetString) {
    var userObj = JSON.parse(packetString);
    var recipient = userObj["payload"]["receiver"];

    if (userObj["type"] == "client_message") {
        // if we're not connected to the client or our connection has been closed, then connect
        if (!isConnectedToHost(recipient)) {
            console.log(recipient);
            console.log("-- MA attempting to connect to: " + recipient + " on port: " + G_classList[recipient]["ma_port"]);

            // create a new socket connection with the indended recipient
            var newSocket =
                    net.connect(G_classList[recipient]["ma_port"], recipient.replace(/#/g, '') + ".host.cs.st-andrews.ac.uk",
                            function () {
                                // if the connection is successful, add the socket to the colleciton of sockets
                                console.log("Successfully connected to: " + recipient + " on port: " + G_classList[recipient]["ma_port"]);
                                G_maHost[this.remoteAddress] = {};
                                G_maHost[this.remoteAddress]["port"] = this.remotePort;
                                G_maHost[this.remoteAddress]["hostname"] = recipient;
                                G_maHost[this.remoteAddress]["client"] = newSocket;
                                // then set up the socket to handle I/O
                                setUpMASocket(newSocket);
                                
                                // then handle the original message which the client intended to send
                                sendMessageToHostMA(userObj);

                            }).on("error",
                    function (e) {
                        // indicate that the conneciton was a failure
                        console.log("-- MA failed to connect to to \"" + recipient + "\": " + e);
                        clearMAHost(recipient);

                        // send a special "connection failure" message to the UI to indicate that we could not connect to the host
                        console.log("-- MA sending connection failure response to UI");
                        var failMsg = JSON.stringify({"type": "connection_failure", "payload": {"receiver": recipient, "id": userObj["payload"]["id"]}});
                        if (wsUI != null)
                            wsUI.send(failMsg);
                    });
        }
        else {
            sendMessageToHostMA(userObj);
        }
    }
}

function isConnectedToHost(hostname) {
    for (var key in G_maHost) {
        if (G_maHost[key]["hostname"] == hostname) {
            return true;
        }
    }
    return false;
}

function getKeyFromHost(hostname) {
    for (var key in G_maHost) {
        if (G_maHost[key]["hostname"] == hostname) {
            return key;
        }
    }
    return null;
}

function sendMessageToHostMA(packetObj) {
    var recipient = packetObj["payload"]["receiver"];
    var hostKey = getKeyFromHost(recipient);

    packetObj["type"] = "agent_message";
    packetObj["payload"]["sender"] = process.argv[4];

    var msg = JSON.stringify(packetObj);
    console.log("-- MA sent to MA (" + recipient + ", " + G_maHost[hostKey]["port"] + ") packet: " + JSON.stringify(packetObj));
    G_maHost[hostKey]["client"].write(msg);

    G_messageCache[packetObj["payload"]["id"]] = msg;

    setTimeout(function () {
        // if we still haven't received a response send an error message
        if (G_messageCache[packetObj["payload"]["id"]] != null) {
            packetObj["type"] = "delivery";
            packetObj["payload"]["timestamp"] = Date.now();
            packetObj["payload"]["success"] = false;

            console.log("-- MA sent response timeout to UI: " + JSON.stringify(packetObj));
            if (wsUI != null)
                wsUI.send(JSON.stringify(packetObj));

            delete G_messageCache[packetObj["payload"]["id"]];
        }
    }, 3000);
}

// Used for both UI & MA

// read class list from local file
function readClassList(writeStudents) {

    var classFile = new linereader(G_classFile);

    classFile.on("error", function (e) {
        console.log("error for " + G_classFile);
    });

    classFile.on("line", function (line) {
        var re = /,/;
        var user = line.split(re);

        G_classList[user[0]] =
                {"uid": user[0],
                    "title": user[1],
                    "firstnames": user[2],
                    "surname": user[3],
                    "ui_port": user[4],
                    "ma_port": user[5]
                };
    });

    classFile.on("end", writeStudents);
}

// code to generate the HTML page for our UI

function generateUIPage(response) {
    response.write(getUIPageStaticTop());
    var writeStudents = function () {
        for (var user in G_classList) {
            var u = G_classList[user];
            response.write(writeUser(u));
        }
        response.end(getUIPageStaticBottom());
    };
    readClassList(writeStudents);
}

/* write the XML-like data structure <student> */
function writeUser(user) {

    var u = user["uid"]
    var sn = user["surname"];
    var fn = user["firstnames"];
    var ui = user["ui_port"];
    var ma = user["ma_port"];

    var student = "                   <tr class=\"contact_row\">\n";

    student += "                      <td class=\"name\">" + fn + " " + sn + "</td>\n";
    student += "                      <td class=\"id optional\">" + u + "</td>\n";
    student += "                      <td class=\"port optional\">" + ui + "</td>\n";
    student += "                      <td class=\"port optional\">" + ma + "</td>\n";

    student += "                   </tr>\n\n";

    return student;
}

function getUIPageStaticTop() {
    return  "<!DOCTYPE html>\n\n" +
            "<html>\n" +
            "<head>\n" +
            "   <link href=\"message.css\" rel=\"stylesheet\" type=\"text/css\" />\n" +
            "   <title>Simple message board</title>\n" +
            "</head>\n\n" +
            "<body>\n\n" +
            "<h1>" + process.argv[4] + "'s Web-Chat Application</h1>\n" +
            "<table class=\"msg_board\">\n" +
            "   <tr>\n" +
            "       <td class=\"contact_selector\">\n\n" +
            "           <div class=\"contacts_wrapper\">\n" +
            "               <table class=\"class_table\">\n\n" +
            "                   <tr>\n" +
            "                       <th class=\"contact\">Contact (select correspondent)</th>\n" +
            "                       <th class=\"id optional\">User ID</th>\n" +
            "                       <th class=\"port optional\">UI Port</th>\n" +
            "                       <th class=\"port optional\">MA Port</th>\n" +
            "                       <th class=\"options_button\" onclick=\"showHideExtraCols()\">+</th>\n" +
            "                   </tr>\n\n";
}

function getUIPageStaticBottom() {
    return  "               </table>\n" +
            "           </div>\n\n" +
            "        </td>\n" +
            "        <td class=\"message_interface\">\n\n" +
            "           <label for=\"user_text\">Type here: \n" +
            "               <input name=\"user_text\" id=\"user_text\" type=\"text\" size=\"80\" minlength=\"1\" maxlength=\"256\" />\n" +
            "           </label>\n\n" +
            "           <button id=\"send\">send</button>\n\n" +
            "           <br /><hr />\n\n" +
            "           <div id=\"messages\">\n" +
            "               <!-- messages added here by Javascript -->\n" +
            "               <!-- markup format of each message is:\n" +
            "               <message>\n" +
            "                   <handle> </handle>\n" +
            "                   <timestamp> >/timestamp>\n" +
            "                   <text> </text>\n" +
            "               <message> </message>\n" +
            "               -->\n" +
            "           </div>\n\n" +
            "           <hr />\n\n" +
            "           <p id=\"status\" class=\"information\">\n" +
            "               <!-- Text added by Javascript -->\n" +
            "           </p>\n\n" +
            "       </td>\n" +
            "   </tr>\n" +
            "</table>\n\n" +
            "</body>\n\n" +
            "<script> var G_server = \"ws://" + os.hostname() + ":" + G_ui_port + "\"</script>\n" +
            "<script> var G_username = \"" + process.argv[4] + "\"</script>\n" +
            "<script src=\"message-client.js\"></script>\n\n" +
            "</html>\n";
}
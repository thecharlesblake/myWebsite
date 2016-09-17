//var G_server <- declared in calling HTML file
var G_handle = null;
var G_maxMessages = 10;
var G_messageCache = {};

function showHideExtraCols() {
    var optionsButton = document.getElementsByClassName("options_button")[0];
    var isPlus = optionsButton.innerHTML == "+";

    var optionalElements = document.getElementsByClassName("optional");
    for (var i = 0; i < optionalElements.length; i++) {
        optionalElements[i].style.display = isPlus ? "table-cell" : "none";
    }
    optionsButton.innerHTML = isPlus ? "-" : "+";
}

document.body.onload = initialise;

function initialise() {
    var messageBox = document.getElementById("messages");
    var messageList = messageBox.childNodes;

    // set up the class table so that one user is "selected" at any given time
    var classTable = document.getElementsByClassName("class_table")[0];
    for (var i = 0, row; row = classTable.rows[i]; i++) {
        row.onclick = makeRowSelected;
    }

    while (messageList.length > 0)
    {
        messageBox.removeChild(messageList[messageList.length - 1]);
    }

    updateStatus("Not connected to Message Agent.", false);

    connect();
}

function makeRowSelected() {
    // remove selection from other rows
    var classTable = document.getElementsByClassName("class_table")[0];
    for (var i = 0, row; row = classTable.rows[i]; i++) {
        row.className = row.className.replace(" selected", "");
    }

    // add selection to the current row
    if (!/selected/.test(this.className)) {
        this.className += " selected";
    }
}

function updateStatus(v, isConnected) {
    if (v == null) {
        return;
    }
    var s = document.getElementById("status");
    s.innerText = v;
    s.style.backgroundColor = isConnected ? "green" : "orange";
    document.getElementById("user_text").disabled = isConnected ? false : true;
    document.getElementById("send").disabled = isConnected ? false : true;
}

var G_ws = null;
function openWebSocket() {
    G_ws = new WebSocket(G_server);

    G_ws.onopen = function (e) {
        updateStatus("Connected to Message Agent", true);
    }

    G_ws.onerrer = function (e) {
        updateStatus("Error connecting to message : " + e, false);
    }

    G_ws.onclose = function (e) {
        updateStatus("Connection to Message Agent closed.", false);
        initialise();
    }

    G_ws.onmessage = function (m) {
        var v = JSON.parse(m.data);
        console.log("-- UI received MA websocket packet: " + m.data);

        if (v["type"] == "agent_message") {
            addToMessageBox(v["payload"]);
        }

        else if (v["type"] == "delivery") {
            if (v["payload"]["success"]) {
                v["payload"]["text"] = G_messageCache[v["payload"]["id"]];
                addToMessageBox(v["payload"]);
            }

            else {
                v["payload"]["text"] = "Message to " + v["payload"]["receiver"] + " failed to send: " + G_messageCache[v["payload"]["id"]];
                delete G_messageCache[v["payload"]["id"]];
                addToMessageBox(v["payload"]);
            }
        }

        else if (v["type"] == "connection_failure") {
            delete G_messageCache[v["payload"]["id"]];
            showConnectionError(v["payload"]["receiver"]);
        }

        else {
            console.log("-- received message type: " + v["type"]);
        }
    }

}

function addToMessageBox(v) {
    var messageBox = document.getElementById("messages");
    var messageList = messageBox.childNodes;

    while (messageList.length >= G_maxMessages)
    {
        messageBox.removeChild(messageList[messageList.length - 1]);
    }

    var data = "";

    var sender = document.createElement("sender");
    data = document.createTextNode(v["sender"]);
    sender.appendChild(data);

    var to = document.createElement("to");
    data = document.createTextNode(" to ");
    to.appendChild(data);

    var receiver = document.createElement("receiver");
    data = document.createTextNode((v["receiver"] == null ? G_username : v["receiver"]));
    receiver.appendChild(data);

    var timestamp = document.createElement("timestamp");
    data = new Date(v["timestamp"]).toString();
    data = document.createTextNode(data);
    timestamp.appendChild(data);

    var id = document.createElement("id");
    data = document.createTextNode(v["id"]);
    id.appendChild(data);

    var text = document.createElement("text");
    data = document.createTextNode(v["text"]);
    text.appendChild(data);

    var message = document.createElement("message");
    message.appendChild(sender);
    message.appendChild(to);
    message.appendChild(receiver);
    message.appendChild(timestamp);
    message.appendChild(id);
    message.appendChild(text);

    messageBox.insertBefore(message, messageList[0]);
}

function showConnectionError(username) {
    var messageBox = document.getElementById("messages");
    var messageList = messageBox.childNodes;

    while (messageList.length >= G_maxMessages)
    {
        messageBox.removeChild(messageList[messageList.length - 1]);
    }

    var text = document.createElement("errorMsg");
    data = document.createTextNode("Could not connect to " + username);
    text.appendChild(data);
    
    var message = document.createElement("message");
    message.appendChild(text);

    messageBox.insertBefore(message, messageList[0]);
}


function send() {
    var selected = document.getElementsByClassName("selected")[0];
    var uid = selected.getElementsByClassName("id")[0].innerHTML;
    var id = Date.now();

    var s = document.getElementById("user_text");
    var text = s.value;
    if (text.length > 0) {
        var m = JSON.stringify({"type": "client_message", "payload": {"receiver": uid, "text": text, "id": id}});
        console.log("-- UI sent websocket packet: " + m);
        G_ws.send(m);
        s.value = "";

        // add message to the cache
        G_messageCache[id] = text;
    }
}

function connect() {
    openWebSocket();
    var s = document.getElementById("send");
    s.onclick = send;
}

function disconnect() {
    if (G_ws != null) {
        G_ws.close();
        G_ws = null;
    }
    initialise();
}

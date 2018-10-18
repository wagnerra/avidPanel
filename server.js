#!/usr/bin/env node

// Central Panel Main Process
//
// SW Development Challenge
// Author: Wagner Correa Ramos

let WebSocketServer = require('websocket').server;
let http = require('http');

// Server TCP/IP port to listen. Example: 8080
const SERVER_PORT = process.env.SERVER_PORT;

if (SERVER_PORT === undefined) {
    console.error("Undefined SERVER_PORT env - You must define SERVER_PORT")
    process.exit(1)
}

let server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(SERVER_PORT, function() {
    console.log((new Date()) + ' Server is listening on port ' + SERVER_PORT);
});
let msgCounter = 0
let robotsMap = new Map()        // Map of Robots x Web clients
let robotsCommand = new Map()    // Map of Robots x Command to send to Robot
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  if (origin !== null) {
    if (! robotsMap.has(origin)) {
        robotsMap.set(origin, new Array());
        robotsCommand.set(origin, 'STANDBY');
        console.log("Created Robot Client Map for " + origin)
    }
  }
  // Any client can connect, just for dev purposes   
  // FIXME: On production we need to have some file to read with all valid Robot Serial Numbers
  return true;       
  // return false;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    let connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            if (message.utf8Data.indexOf("WEB") === 0) {
                // Message from web browser
                if (message.utf8Data.indexOf("SELECT") === 4) {
                    let robotSN = message.utf8Data.substr(11).trim()
                    console.log("Request SELECT Robot " + robotSN)
                    if (robotsMap.has(robotSN)) {
                        let clientList = robotsMap.get(robotSN);
                        clientList.push(connection)
                        console.log("Web client attached to robot " + robotSN)
                        robotsCommand.set(robotSN, 'SELECT');
                    }
                    connection.sendUTF(
                        JSON.stringify({ type:'color', data: 'green' }));
                }
                else
                if (message.utf8Data.indexOf("START") === 4) {
                    let robotSN = message.utf8Data.substr(10).trim()
                    console.log("Request START Robot " + robotSN)
                    if (robotsCommand.has(robotSN)) {
                        console.log("Web client started robot " + robotSN)
                        robotsCommand.set(robotSN, 'START');
                    }
                    connection.sendUTF(
                        JSON.stringify({ type:'color', data: 'green' }));
                }
            }
            else
            if (message.utf8Data.indexOf("{") === 0) {
                // Message JSON from Robots
                robotMsg = JSON.parse(message.utf8Data)
                console.log("JSON Message from Robot " + robotMsg.robotSN)
                if (robotsMap.has(robotMsg.robotSN)) {
                    let clientList = robotsMap.get(robotMsg.robotSN)
                    let json = JSON.stringify({ type:'robot-data', data: robotMsg });
                    for (let i in clientList) {
                        console.log("JSON robot-data sent to web client")
                        clientList[i].sendUTF(json);
                    }
                }
                if (robotsCommand.has(robotMsg.robotSN)) {
                    if (robotsCommand.get(robotMsg.robotSN) === 'START') {
                        connection.sendUTF('START');     // Send START command to Robot
                        robotsCommand.set(robotMsg.robotSN, 'STANDBY');
                    }
                    else
                    if (robotsCommand.get(robotMsg.robotSN) === 'SELECT') {
                        connection.sendUTF('SELECT');     // Send SELECT command to Robot
                        robotsCommand.set(robotMsg.robotSN, 'STANDBY');
                    }
                }
            }
            else {
                // Message from Robots
                let robotSN = message.utf8Data.substr(0, message.utf8Data.indexOf(' ')).trim()
                console.log("TEXT Message from Robot " + robotSN)
                if (robotsMap.has(robotSN)) {
                    let clientList = robotsMap.get(robotSN)
                    let obj = {
                        time: (new Date()).getTime(),
                        text: message.utf8Data,
                        author: robotSN,
                        color: 'green'
                    };
                    // broadcast message to all connected clients for this Robot
                    let json = JSON.stringify({ type:'message', data: obj });
                    for (let i in clientList) {
                        console.log("JSON message sent to web client")
                        clientList[i].sendUTF(json);
                    }
                }
            }
            // connection.sendUTF(message.utf8Data);
            // if ((++msgCounter % 1000) === 0) {      // Testing
            //    connection.sendUTF('START');
            // }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

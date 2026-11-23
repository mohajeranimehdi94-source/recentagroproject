const WebSocket = require('ws');
let wss = null;

function initP4WebSocket(server) {
  wss = new WebSocket.Server({
    server,
    path: '/p5/ws'
  });

  wss.on('connection', (ws) => {
    console.log('WS p4 connected');

    ws.on('close', () => {
      console.log('WS p4 disconnected');
    });

    //
     ws.on('message', msg => {
    // اینجا msg فقط در حافظه رم سرور است
    console.log(wss.clients)
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    });
  });
  //
  
  });
}

function sendToP4Clients(data) {
  if (!wss) return;

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = {
  initP4WebSocket,
  sendToP4Clients
};
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');

const router = express.Router();

const db = new sqlite3.Database('./chat.db');

db.run(`
  CREATE TABLE IF NOT EXISTS chat (
    text TEXT,
    time TEXT,
    date TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
   const lists =[];
      db.all('SELECT * FROM members',[],(err,rowse)=>{
        if (err) {
      return
    }
    rowse.forEach(r=>{lists.push(r)})
      })

let wss = null;

function initP4WebSocket(server) {
  wss = new WebSocket.Server({
    server,
    path: '/p5/ws'
  });

  wss.on('connection', (ws,req) => {
    console.log('WS p4 connected');
    const ip =req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  // 2️⃣ تمیز کردن IPv6
  const cleanIP = ip.replace("::ffff:", "");
console.log(cleanIP);
  // 3️⃣ وصل کردن IP به همون کلاینت
  ws.ip = cleanIP;
console.log(lists)
    ws.on('message', msg => {
     // const text = msg.toString();
     // const now = new Date();
      const time =JSON.parse(msg.toString()).time;
      const date =JSON.parse(msg.toString()).date;
      const text =JSON.parse(msg.toString()).text;
      const member = lists.find(l => l.ip === ws.ip);
    const name = member?.name || 'ناشناس';


      db.run(
        'INSERT INTO chat (text, time, date, name) VALUES (?, ?, ?, ?)',
        [
          text,time,date,name
         // now.toLocaleTimeString('fa-IR'),
          //now.toLocaleDateString('fa-IR')
        ]
      );

      // broadcast
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({text:text,time:time,date:date,name:name,ip:ws.ip}));
        }
      });
    });

    ws.on('close', () => {
      console.log('WS p4 disconnected');
    });
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

/* ---------- REST API ---------- */

router.get('/chats', (req, res) => {
  db.all('SELECT * FROM chat ORDER BY created_at ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).send('خطای دیتابیس');
    }
    res.json(rows); // بهتر از JSON.stringify
  });
});

module.exports = {
  initP4WebSocket,
  sendToP4Clients,
  router
};

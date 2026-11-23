const express = require('express');
const app = express();
const path =require('path');
const http =require('http');
const { initP4WebSocket } = require('./ws-p4');

/* HTTP SERVER */
const server = http.createServer(app);

/* INIT WS */
initP4WebSocket(server);

app.use('/p1', require('./projectres/server'));
app.use('/p2', require('./projectwei/server'));
app.use('/p3', require('./projectserial/server'));
app.use('/p4', require('./projectpart/server'));


// 🚀 سرو پروژه React بیلدشده
app.use(express.static(path.join(__dirname, 'dist')));

// هر مسیر دیگری → index.html React
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
//app.use('/p1', express.static(path.join(__dirname, 'projectres/public')));
//app.use('/p2', express.static(path.join(__dirname, 'projectwei/public')));
//app.use('/p3', express.static(path.join(__dirname, 'projectserial/public')));
app.use(express.static(path.join(__dirname, 'public')));
server.listen(4000, '0.0.0.0', () => {
  console.log('Server listening on 0.0.0.0:4000');
});

//app.listen(4000, () => console.log("Main server on port 3000"));

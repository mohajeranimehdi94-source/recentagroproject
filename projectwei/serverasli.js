// server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();


const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'data.db');


app.use(cors());
app.use(express.json());


// اتصال به دیتابیس
const db = new sqlite3.Database(DB_PATH, (err) => {
if (err) {
console.error('Failed to open DB:', err.message);
} else {
console.log('SQLite DB connected:', DB_PATH);
}
});


// مسیر API برای دریافت همه آیتم‌ها
app.get('/api/items', (req, res) => {
const sql = 'SELECT id, name, barcode,volum,weight,width,lenght,height FROM items ORDER BY id ASC';
db.all(sql, [], (err, rows) => {
if (err) return res.status(500).json({ error: err.message });
res.json(rows);
});
});


// مثال: دریافت یک آیتم خاص
app.get('/api/items/:id', (req, res) => {
const sql = 'SELECT id, name, qty FROM items WHERE id = ?';
db.get(sql, [req.params.id], (err, row) => {
if (err) return res.status(500).json({ error: err.message });
if (!row) return res.status(404).json({ error: 'Not found' });
res.json(row);
});
});

app.get('/vehicle', (req, res) => {
  db.all('SELECT * FROM vehicles', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});



// مثال: افزودن آیتم جدید
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// project1/server.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();


// مسیر دیتابیس
const DB_PATH = path.join(__dirname, 'data.db');

// اتصال به دیتابیس
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
  } else {
    console.log('SQLite DB connected:', DB_PATH);
  }
});

// Middleware فقط برای این Router
router.use(express.json());
router.use(express.static(path.join(__dirname, 'public')));

// مسیر API برای دریافت همه آیتم‌ها
router.get('/api/items', (req, res) => {
  const sql = 'SELECT id, name, barcode, volum, weight, width, lenght, height FROM items ORDER BY id ASC';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// دریافت یک آیتم خاص
router.get('/api/items/:id', (req, res) => {
  const sql = 'SELECT id, name, qty FROM items WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// مسیر برای وسایل نقلیه
router.get('/vehicle', (req, res) => {
  db.all('SELECT * FROM vehicles', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});
// روت ذخیره
router.post('/saved', (req, res) => {
  const { carname, cuname, cpid,vo,we,val } = req.body;

  if (!carname || !cuname || !cpid) {
    return res.status(400).json({ error: 'همه فیلدها الزامی هستند' });
  }
//
db.all('SELECT * FROM saved', [], (err, rows) => {
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  // بررسی تکراری بودن
  const exists = rows.some(i => 
   // i.carname === carname &&
   // i.cuname === cuname &&
    i.cpid === cpid 
   // i.v === vo &&
   // i.w === we
  );

  if (exists) {
    return res.status(400).json({ error: "مشخصات تکراری می‌باشد" });
  }

  // در غیر این صورت، داده جدید رو ذخیره کن
  const sql = `INSERT INTO saved (carname, cuname, cpid, v, w, val) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [carname, cuname, cpid, vo, we,val], function(err) {
    if (err) {
      return res.status(500).json({ error: "خطا در ذخیره داده‌ها" });
    }
    res.json({ success: true, id: this.lastID });
  });
});


//
});
router.get('/sendsaved',(req,res)=>{
const sql='SELECT * FROM saved';
db.all(sql,[],(err,row)=>{
  if(err){
    res.status(400).json({err:"داده ای برای نمایش وجود ندارد"})
  }
  res.status(200).json(row);
})
});

router.delete('/delitem/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM saved WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, deletedID: id });
  });
});



module.exports = router;

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const router =express.Router();

const DB_PATH=path.join(__dirname,'data.db');
const db = new sqlite3.Database(DB_PATH,(err)=>{
    if(err){console.error('failed')}else{console.log('conected')}
});
db.run(`CREATE TABLE IF NOT EXISTS serials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crname TEXT,
  sdate TEXT,
  serial TEXT
)`);

router.use(express.json());
router.use(express.static(path.join(__dirname, 'public')));
router.get("/customers", (req, res) => {
  const sql = "SELECT * FROM customer";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }
    return res.status(200).json(rows);
  });
});
router.post("/saveserial", (req, res) => {
  let ip = req.ip;

if (ip.startsWith("::ffff:")) { 
  ip = ip.substring(7); 
} 

  const dataArray = req.body;
  console.log(req.body)
  if (!Array.isArray(dataArray)) {
    return res.status(400).json({ error: "Expected an array of objects" });
  }
if(ip!=='192.168.1.49'){ return res.status(403).json({err:"امکان ثبت دستگاه وجود ندارد"})}
  const sql = "INSERT INTO serials (crname, sdate, serial) VALUES (?, ?, ?)";

  db.all("SELECT * FROM serials", [], async (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    try {
      for (const item of dataArray) {
        const { name, date, fin } = item;

        // بررسی تکراری بودن
        if (rows.some(r => r.serial === fin)) {
          return res.status(400).json({ error: "سریال تکراری است", serial: fin });
        }

        // درج در دیتابیس
        await new Promise((resolve, reject) => {
          db.run(sql, [name, date, fin], function (err) {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      // اگه همه با موفقیت درج شدند
      return res.status(201).json({ message: "All saved successfully" });
    } catch (e) {
      console.error("Insert error:", e);
      return res.status(500).json({ error: "Insert failed" });
    }
  });
});
router.get('/sedata', (req, res) => {
  const sql = 'SELECT * FROM serials';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    return res.status(200).json(rows);
  });
});
router.get('/rid',(req,res)=>{
  const ip=req.ip;
  res.json({ip})
})





module.exports = router;
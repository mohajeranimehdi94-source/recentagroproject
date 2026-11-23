// project1/server.js
process.env.TZ = 'Asia/Tehran';
const express  = require('express');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const multer   = require('multer');
const { exec } = require('child_process');
const moment   = require('moment-jalaali');
const sqlite3  = require('sqlite3').verbose();
const Kavenegar = require('kavenegar');

const api = Kavenegar.KavenegarApi({ apikey: 'YOUR_API_KEY_HERE' });
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });
console.log(sqlite3.VERSION);
// SQLite DB
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    destinationCity TEXT,
    vehicleType TEXT,
    loadingTime TEXT,
    date TEXT,
    fileName TEXT,
    shahriLabelFile TEXT,
    IP TEXT ,
    irica TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS vehicle_times (
    vehicleType TEXT PRIMARY KEY,
    duration INTEGER
  )`);
});

const router = express.Router();
router.use(cors());
router.use(express.json());
router.use('/public', express.static(path.join(__dirname, 'public')));
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const eventsFile = path.join(__dirname, 'events.json');
const logEvent = (msg) => {
  const now = moment().format('jYYYY/jMM/jDD HH:mm:ss');
  const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile, 'utf8')) : [];
  events.push(`[${now}] ${msg}`);
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
};

function getTodayJalaliFolder() {
  return moment().format('jYYYYjMMjDD');
}

function getMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Multer setup
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder = getTodayJalaliFolder();
    const base = req.originalUrl.includes('/upload/shahri-label')
      ? path.join(__dirname, 'uploads', 'shahri-labels', folder)
      : path.join(__dirname, 'uploads', folder);
    fs.mkdirSync(base, { recursive: true });
    cb(null, base);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const customerName = (req.body.customerName || 'file').trim().replace(/\s+/g, '_');
    const destinationCity = (req.body.destinationCity || 'city').trim().replace(/\s+/g, '_');
    const dateStr = (req.body.date || '').replace(/\//g, '');
    const timestamp = Date.now();
    cb(null, `${customerName}_${destinationCity}_${dateStr}_${timestamp}${ext}`);
  }
});
const upload = multer({ storage });

// ----------------------- Routes -----------------------

// Jalali dates
router.get('/api/jalali-dates', (req, res) => {
  exec('wmic os get LocalDateTime /value', (err, stdout) => {
    if (err) return res.status(500).json({ error: 'WMIC failed' });
    const match = stdout.match(/LocalDateTime=(\d{14})/);
    if (!match) return res.status(500).json({ error: 'Invalid WMIC output' });
    const raw = match[1];
    const base = moment(`${raw.substr(0,4)}-${raw.substr(4,2)}-${raw.substr(6,2)}T${raw.substr(8,2)}:${raw.substr(10,2)}:${raw.substr(12,2)}`);
    const results = [];
    for (let i = 0; results.length < 7 && i < 10; i++) {
      const temp = base.clone().add(i, 'days');
      if (temp.day() !== 5) results.push({ date: temp.format('jYYYY/jMM/jDD'), weekday: temp.format('dddd') });
    }
    res.json(results);
  });
});

// Get all reservations
router.get('/reservationscheck', (req, res) => {
  db.all('SELECT * FROM reservations', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB read failed' });
    res.json(rows);
  });
});

// Get future reservations
router.get('/reservations', (req, res) => {
  const today = moment().format('jYYYY/jMM/jDD');
  const sql = `SELECT r.*, v.duration AS vehicleDuration FROM reservations r JOIN vehicle_times v ON r.vehicleType = v.vehicleType WHERE r.date >= ? OR r.sended = 0`;
  db.all(sql, [today], (err, rows) => {
    if (err) return res.status(500).send('خطا در دریافت رزروها');
    res.json(rows);
  });
});

// Get vehicle types
router.get('/vehicles', (req, res) => {
  db.all('SELECT * FROM vehicle_times', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB read failed' });
    res.json(rows);
  });
});

// Upload reservation
router.post('/upload-reservation', upload.single('document'), (req, res) => {
  console.log(req.body)
  if (!req.file) return res.status(400).json('لطفا یک حواله انبار ارسال کنید');
  const userIP = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace('::ffff:', '').trim();
  const { customerName, destinationCity, vehicleType, loadingTime, date } = req.body;
  const du =JSON.parse(req.body.du)
  if (![customerName, destinationCity, vehicleType, loadingTime, date].every(Boolean)) return res.status(400).json({ error: 'فیلدهای ضروری ناقص‌اند' });

  const relPath = path.join('uploads', getTodayJalaliFolder(), req.file.filename);
 // const startMin = getMinutes(loadingTime);
//console.log(vehicleType)
 // db.get('SELECT duration FROM vehicle_times WHERE vehicleType = ?', [vehicleType], (err, row) => {
   // if (err || !row) return res.status(400).json({ error: 'مدت بارگیری برای این وسیله تعریف نشده است' });
   // const duration = row.duration;
   // const endMin = startMin + duration;

   // db.all('SELECT * FROM reservations WHERE vehicleType = ? AND date = ?', [vehicleType, date], (err, rows) => {
     // if (err) return res.status(500).json({ error: 'DB read failed' });
     // const conflict = rows.some(r => {
      //  const s = getMinutes(r.loadingTime);
      //  const e = s + duration;
      //  return (startMin >= s && startMin < e) || (s >= startMin && s < endMin);
    //  });
     // if (conflict) return res.status(409).json({ error: 'تداخل زمانی وجود دارد' });

      db.run(
        `INSERT INTO reservations (customerName, destinationCity, vehicleType, loadingTime, date, fileName, IP,duration,sended) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerName, destinationCity, vehicleType, loadingTime, date, relPath, userIP,du,0],
        function(err) {
          if (err) return res.status(500).json({ error: 'DB insert failed' });
          logEvent(`رزرو جدید برای ${customerName} ثبت شد`);
          res.json({ success: true, id: this.lastID });
        }
      );
   // });
 // });
});

// Replace file
router.post('/replace-file', upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'هیچ فایلی ارسال نشد' });
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID خالی است' });

  db.get('SELECT * FROM reservations WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'رزرو یافت نشد' });

    if (row.fileName && fs.existsSync(path.join(__dirname, row.fileName))) fs.unlinkSync(path.join(__dirname, row.fileName));
    const sanitize = s => (s || 'file').toString().replace(/[\\/:\*\?"<>|]/g, '_').replace(/\s+/g, '_');
    const partCustomer = sanitize(row.customerName);
    const partCity = sanitize(row.destinationCity);
    let partDate = row.date && row.date.includes('/') ? sanitize(row.date.split('/').reverse().join('_')) : 'تاریخ';
    const ext = path.extname(req.file.originalname);
    const newName = `${partCustomer}_${partCity}_${partDate}_${id}${ext}`;
    const newAbs = path.join(path.dirname(req.file.path), newName);
    fs.renameSync(req.file.path, newAbs);
    const newRel = path.relative(__dirname, newAbs);

    db.run('UPDATE reservations SET fileName = ? WHERE id = ?', [newRel, id], (err) => {
      if (err) return res.status(500).json({ error: 'DB update failed' });
      logEvent(`فایل پیوست رزرو ${row.customerName} جایگزین شد`);
      res.json({ success: true, fileName: newRel });
    });
  });
});

// Upload shahri-label
router.post('/upload/shahri-label/:id', upload.single('documentsh'), (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'فایل ارسال نشد' });

  db.get('SELECT customerName,destinationCity,date FROM reservations WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'رزرو یافت نشد' });

    const folder = getTodayJalaliFolder();
    const dest = path.join(__dirname, 'uploads', 'shahri-labels', folder);
    fs.mkdirSync(dest, { recursive: true });

    const sanitize = s => (s || 'نامشخص').toString().replace(/[\\/:\*\?"<>|]/g, '_').replace(/\s+/g, '_');
    const partCustomer = sanitize(row.customerName);
    const partCity = sanitize(row.destinationCity);
    const partDate = row.date && row.date.includes('/') ? sanitize(row.date.split('/').reverse().join('_')) : 'تاریخ';
    const ext = path.extname(req.file.originalname);
    const newName = `${partCustomer}_${partCity}_${partDate}_${id}${ext}`;
    const newAbs = path.join(dest, newName);
    fs.renameSync(req.file.path, newAbs);
    const relPath = path.relative(__dirname, newAbs);

    db.run('UPDATE reservations SET irica = ? WHERE id = ?', [relPath, id], (err) => {
      if (err) return res.status(500).json({ error: 'DB update failed' });
      logEvent(`فایل برچسب شهری رزرو ${row.customerName} ثبت شد`);
      res.json({ success: true, fileName: relPath });
    });
  });
});

// Delete reservation/file
router.post('/delete-reservation', (req, res) => {
  const userIP = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace('::ffff:', '').trim();
  const { id, deleteType } = req.body;
  if (!id) return res.status(400).json({ error: 'ID خالی است' });

  db.get('SELECT * FROM reservations WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'رزرو یافت نشد' });
    if (row.IP !== userIP) return res.status(403).json({ error: 'امکان حذف این رزرو برای شما فراهم نیست' });

    const deleteFiles = () => {
      if (row.fileName && fs.existsSync(path.join(__dirname, row.fileName))) fs.unlinkSync(path.join(__dirname, row.fileName));
      if (row.shahriLabelFile && fs.existsSync(path.join(__dirname, row.shahriLabelFile))) fs.unlinkSync(path.join(__dirname, row.shahriLabelFile));
    };

    if (deleteType === 'file') {
      if (row.fileName && fs.existsSync(path.join(__dirname, row.fileName))) fs.unlinkSync(path.join(__dirname, row.fileName));
      db.run('UPDATE reservations SET fileName = NULL WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'DB update failed' });
        logEvent(`فایل پیوست رزرو ${row.customerName} حذف شد`);
        res.json({ success: true });
      });
    } else if (deleteType === 'all') {
      deleteFiles();
      db.run('DELETE FROM reservations WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'DB delete failed' });
        logEvent(`رزرو ${row.customerName} به طور کامل حذف شد`);
        res.json({ success: true });
      });
    } else {
      res.status(400).json({ error: 'نوع حذف نامعتبر است' });
    }
  });
});

// Events
router.get('/events', (req, res) => {
  const data = fs.existsSync(eventsFile) ? fs.readFileSync(eventsFile, 'utf8') : '[]';
  res.json(JSON.parse(data));
});

router.post('/events', (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'پیام خالی است' });
  logEvent(message.trim());
  res.json({ success: true });
});

router.delete('/events/:msg', (req, res) => {
  const msg = decodeURIComponent(req.params.msg);
  const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile, 'utf8')) : [];
  const index = events.indexOf(msg);
  if (index !== -1) {
    events.splice(index, 1);
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'رویداد یافت نشد' });
  }
});
router.post('/savelabel',(req,res)=>{
  
  const value =`${req.body.nl},${req.body.cl},${req.body.phl},${req.body.tyl},${req.body.se},${req.body.sr},${req.body.st}`;
  console.log(value)
  const id =req.body.sd;
  const sql = `UPDATE reservations SET shahriLabelFile = ? WHERE id = ?`;
  db.run(sql, [value, id], function (err) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "خطا در به‌روزرسانی داده" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "ردیفی با این id پیدا نشد" });
    }
    res.json({ message: "سلول با موفقیت به‌روزرسانی شد", changes: this.changes });
  });
})
router.post('/desc',(req,res)=>{
  const id =req.body.id;
  const value =req.body.disc;
  const sql = 'UPDATE reservations SET disc=? WHERE id=?';
  db.run(sql,[value,id],function(err){
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "خطا در به‌روزرسانی داده" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "ردیفی با این id پیدا نشد" });
    }
    res.json({ message: "سلول با موفقیت به‌روزرسانی شد", changes: this.changes });

  })

})
router.get('/history',(req,res)=>{
  db.all('SELECT * FROM reservations',[],(err,rowh)=>{
    if(err){return res.status(500).json({mess:"خطا در دیتابیس"})}
    res.json(rowh)
  })
});
router.get('/ipstat',(req,res)=>{
  const userIP = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace('::ffff:', '').trim();
  res.json({ ip: userIP });

});
router.post('/changest',(req,res)=>{
  console.log(req.body);
  const id= req.body.id;
  const stat = req.body.stat;
  const sql = 'UPDATE reservations SET sended=? WHERE id=?'
  db.run(sql,[stat,id],(err)=>{
    if(err){return res.status(500).json("database error")}
    res.json({mess:"succes"})
  })
});
router.post('/edittimeanddate',(req,res)=>{
  const time=req.body.time;
  const date=req.body.date;
  const id = req.body.id;
  const sql ='UPDATE reservations SET loadingTime=? , date=? WHERE id=?'
  db.run(sql,[time,date,id],(err)=>{
    if(err){return res.status(404).json({m:"database error"})}
    res.status(200).json({m:"ثبت شد"})
  })
})

module.exports = router;

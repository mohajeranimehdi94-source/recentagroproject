// server.js – نسخه کامل با SQLite (سازگار با Node v13.14.0 و Windows 7 32‑bit)
// -----------------------------------------------------------------------------
// امکانات:
//   • رزرو بارگیری با جلوگیری از تداخل زمانی بر اساس مدت هر وسیله
//   • آپلود فایل پیوست و برچسب شهری + امکان جایگزینی یا حذف
//   • ثبت رویدادها در events.json (حفظ منطق قبلی)
// -----------------------------------------------------------------------------

process.env.TZ = 'Asia/Tehran';
const express  = require('express');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const multer   = require('multer');
// const { v4: uuidv4 } = require('uuid'); // حذف شده
const { exec } = require('child_process');
const moment   = require('moment-jalaali');
const sqlite3  = require('sqlite3').verbose();
const Kavenegar = require('kavenegar');
const api = Kavenegar.KavenegarApi({ apikey: '6C74686E4847595776554366694977344564655557354673313042326568516553446D395741625773626F3D' });

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

// -----------------------------------------------------------------------------
// پایگاه‌داده SQLite
// -----------------------------------------------------------------------------
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

db.serialize(() => {
  // جدول رزروها با id عددی اتواینکریمنت
  db.run(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    destinationCity TEXT,
    vehicleType TEXT,
    loadingTime TEXT,
    date TEXT,
    fileName TEXT,
    shahriLabelFile TEXT
  )`);

  // جدول زمان بارگیری وسایل
  db.run(`CREATE TABLE IF NOT EXISTS vehicle_times (
    vehicleType TEXT PRIMARY KEY,
    duration INTEGER
  )`);
});

// -----------------------------------------------------------------------------
// تنظیمات عمومی
// -----------------------------------------------------------------------------
const app   = express();
const PORT  = 4000;

app.use(cors({ origin: 'http://192.168.1.49:5000' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// پوشه امروز به تقویم شمسی
const getTodayJalaliFolder = () => moment().format('jYYYYjMMjDD');

// تبدیل «HH:mm» به دقیقه
const getMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// ثبت رویداد در فایل events.json (منطق قبلی حفظ شد)
const eventsFile = path.join(__dirname, 'events.json');
const logEvent = (msg) => {
  const now = moment().format('jYYYY/jMM/jDD HH:mm:ss');
  const events = fs.existsSync(eventsFile) ? JSON.parse(fs.readFileSync(eventsFile, 'utf8')) : [];
  events.push(`[${now}] ${msg}`);
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
};
//
function sendSMS(to, text) {
  api.Send({ message: text, sender: "2000660110", receptor: to }, function(response, status) {
    console.log(response);
  });
}



// -----------------------------------------------------------------------------
// مسیرهای کمکی تقویم جلالی (بدون تغییر)
// -----------------------------------------------------------------------------
app.get('/api/jalali-dates', (req, res) => {
  exec('wmic os get LocalDateTime /value', (err, stdout) => {
    if (err) return res.status(500).json({ error: 'WMIC failed' });

    const match = stdout.match(/LocalDateTime=(\d{14})/);
    if (!match) return res.status(500).json({ error: 'Invalid WMIC output' });

    const raw = match[1];
    const y = raw.substr(0, 4);
    const m = raw.substr(4, 2);
    const d = raw.substr(6, 2);
    const H = raw.substr(8, 2);
    const M = raw.substr(10, 2);
    const S = raw.substr(12, 2);

    const base = moment(`${y}-${m}-${d}T${H}:${M}:${S}`);
    const results = [];
    for (let i = 0; results.length < 7 && i < 10; i++) {
      const temp = base.clone().add(i, 'days');
      if (temp.day() !== 5) {
        results.push({
          date: temp.format('jYYYY/jMM/jDD'),
          weekday: temp.format('dddd')
        });
      }
    }
    res.json(results);
  });
});

// -----------------------------------------------------------------------------
// خواندن داده‌ها از SQLite
// -----------------------------------------------------------------------------
app.get('/reservationscheck', (req, res) => {
  db.all('SELECT * FROM reservations', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB read failed' });
    res.json(rows);
  });
});

app.get('/reservations', (req, res) => {
  const today = moment().format('jYYYY/jMM/jDD');
  const sql = `
  SELECT r.*, v.duration AS vehicleDuration
  FROM reservations r
  JOIN vehicle_times v ON r.vehicleType = v.vehicleType
  WHERE r.date >= ?
`;
db.all(sql, [today], (err, rows) => {
  if (err) return res.status(500).send('خطا در دریافت رزروها');
  res.json(rows);
});

});

app.get('/vehicles', (req, res) => {
  db.all('SELECT * FROM vehicle_times', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB read failed' });
    res.json(rows);
  });
});

// -----------------------------------------------------------------------------
// تنظیمات Multer برای آپلود فایل‌ها (بدون تغییر بنیادی)
// -----------------------------------------------------------------------------
const storage = multer.diskStorage({
    destination(req, file, cb) {
      const folder = getTodayJalaliFolder();
      const base   = req.originalUrl.includes('/upload/shahri-label')
                   ? path.join(__dirname, 'uploads', 'shahri-labels', folder)
                   : path.join(__dirname, 'uploads', folder);
      fs.mkdirSync(base, { recursive: true });
      cb(null, base);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
  
      // دریافت نام مشتری، شهر و تاریخ از req.body
      const customerName = (req.body.customerName || 'file').trim().replace(/\s+/g, '_');
      const destinationCity = (req.body.destinationCity || 'city').trim().replace(/\s+/g, '_');
      const dateStr = (req.body.date || '').replace(/\//g, '');
  
      // ساخت نام فایل به صورت customerName_destinationCity_date_timestamp.ext
      const timestamp = Date.now();
      const filename = `${customerName}_${destinationCity}_${dateStr}_${timestamp}${ext}`;
  
      cb(null, filename);
    }
  });
  
const upload = multer({ storage });

// -----------------------------------------------------------------------------
// POST /upload-reservation  (تبدیل کامل به SQLite + جلوگیری از تداخل)
// -----------------------------------------------------------------------------
app.post('/upload-reservation', upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json('لطفا یک حواله انبار ارسال کنید');

  const userIP = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace('::ffff:', '').trim();
  console.log("IP:", userIP);
  const { customerName, destinationCity, vehicleType, loadingTime, date } = req.body;
  if (![customerName, destinationCity, vehicleType, loadingTime, date].every(Boolean))
    return res.status(400).json({ error: 'فیلدهای ضروری ناقص‌اند' });

  const relPath  = path.join('uploads', getTodayJalaliFolder(), req.file.filename);
  const startMin = getMinutes(loadingTime);

  db.get('SELECT duration FROM vehicle_times WHERE vehicleType = ?', [vehicleType], (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'مدت بارگیری برای این وسیله تعریف نشده است' });
    const duration = row.duration;
    const endMin   = startMin + duration;

    db.all('SELECT * FROM reservations WHERE vehicleType = ? AND date = ?', [vehicleType, date], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB read failed' });

      const conflict = rows.some(r => {
        const existingStart = getMinutes(r.loadingTime);
        const existingEnd   = existingStart + duration;
        return (
          (startMin >= existingStart && startMin < existingEnd) ||
          (existingStart >= startMin && existingStart < endMin)
        );
      });

      if (conflict) return res.status(409).json({ error: 'تداخل زمانی وجود دارد' });

      db.run(
        `INSERT INTO reservations (customerName, destinationCity, vehicleType, loadingTime, date, fileName,IP) VALUES (?, ?, ?, ?, ?, ?,?)`,
        [customerName, destinationCity, vehicleType, loadingTime, date, relPath,userIP],
        function(err) {
          if (err) return res.status(500).json({ error: 'DB insert failed' });
          logEvent(`رزرو جدید برای ${customerName} ثبت شد`);
          //sendSMS("09187582260",` برای اقای  ${customerName} به مقصد  ${destinationCity}  تاریخ ارسال ${date} رزرو جدید ثبت شد`);
                    const newId = this.lastID;
          res.json({ success: true, id: newId });
        }
      );
    });
  });
});

// -----------------------------------------------------------------------------
// POST /replace-file  (بروزرسانی فایل پیوست در SQLite)
// -----------------------------------------------------------------------------
app.post('/replace-file', upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'هیچ فایلی ارسال نشد' });
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID خالی است' });

  db.get('SELECT * FROM reservations WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'رزرو یافت نشد' });

    // حذف فایل قبلی اگر وجود داشت
    if (row.fileName && fs.existsSync(path.join(__dirname, row.fileName))) {
      fs.unlinkSync(path.join(__dirname, row.fileName));
    }

    // ساخت نام جدید بر اساس customerName
   /* ---------- ساخت نام فایل جدید ---------- */
const sanitize = s =>
(s || 'file')
  .toString()
  .replace(/[\\/:\*\?"<>|]/g, '_') // کاراکترهای ممنوع
  .replace(/\s+/g, '_');

const partCustomer = sanitize(row.customerName);
const partCity     = sanitize(row.destinationCity);

// تبدیل تاریخ به روز_ماه_سال
let partDate = row.date || 'تاریخ';
const [y, m, d] = partDate.split('/');
partDate = sanitize(`${d}_${m}_${y}`);

const ext     = path.extname(req.file.originalname);
const newName = `${partCustomer}_${partCity}_${partDate}_${id}${ext}`;

    const newAbs   = path.join(path.dirname(req.file.path), newName);
    fs.renameSync(req.file.path, newAbs);
    const newRel   = path.relative(__dirname, newAbs);

    db.run('UPDATE reservations SET fileName = ? WHERE id = ?', [newRel, id], (err) => {
      if (err) return res.status(500).json({ error: 'DB update failed' });
      logEvent(`فایل پیوست رزرو ${row.customerName} جایگزین شد`);
      res.json({ success: true, fileName: newRel });
    });
  });
});

// -----------------------------------------------------------------------------
// POST /upload/shahri-label/:id  (ذخیره فایل برچسب شهری)
// -----------------------------------------------------------------------------
app.post('/upload/shahri-label/:id', upload.single('documentsh'), (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'فایل ارسال نشد' });

  db.get('SELECT customerName,destinationCity, date FROM reservations WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'رزرو یافت نشد' });

    const folder = getTodayJalaliFolder();
    const dest   = path.join(__dirname, 'uploads', 'shahri-labels', folder);
    fs.mkdirSync(dest, { recursive: true });
    //
    const sanitize = s =>
    (s || 'نامشخص')
      .toString()
      .replace(/[\\/:\*\?"<>|]/g, '_')
      .replace(/\s+/g, '_');
  
  const partCustomer = sanitize(row.customerName);
  const partCity     = sanitize(row.destinationCity);
  let partDate       = row.date;
  
  if (partDate && partDate.includes('/')) {
    const [y, m, d] = partDate.split('/');
    partDate = sanitize(`${d}_${m}_${y}`);
  } else {
    partDate = 'تاریخ';
  }
  
  const ext     = path.extname(req.file.originalname);
  const newName = `${partCustomer}_${partCity}_${partDate}_${id}${ext}`;
  
  
    const newAbs   = path.join(dest, newName);
    fs.renameSync(req.file.path, newAbs);

    const relPath = path.relative(__dirname, newAbs);
    db.run('UPDATE reservations SET shahriLabelFile = ? WHERE id = ?', [relPath, id], (err) => {
      if (err) return res.status(500).json({ error: 'DB update failed' });
      logEvent(`برچسب شهری برای رزرو ${row.customerName} بارگذاری شد`);
      res.json({ message: 'برچسب شهری ثبت شد' });
    });
  });
});

// -----------------------------------------------------------------------------
// POST /delete-reservation  (حذف فایل یا رکورد کامل)
// -----------------------------------------------------------------------------
app.post('/delete-reservation', (req, res) => {
    console.log('Received body:', req.body);
    const userIP = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace('::ffff:', '').trim();
    console.log(userIP);
  const { id, deleteType } = req.body;
  if (!id) return res.status(400).json({ error: 'ID خالی است' });

  db.get('SELECT * FROM reservations WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'رزرو یافت نشد' });
    if (row.IP !== userIP) {
      return res.status(403).json({ error: "امکان حذف این رزرو برای شما فراهم نیست" });
    }

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

// -----------------------------------------------------------------------------
// مدیریت رویدادها (بدون تغییر در منطق فایل JSON)
// -----------------------------------------------------------------------------
app.get('/events', (req, res) => {
  const data = fs.existsSync(eventsFile) ? fs.readFileSync(eventsFile, 'utf8') : '[]';
  res.json(JSON.parse(data));
});

app.post('/events', (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'پیام خالی است' });
  logEvent(message.trim());
  res.json({ success: true });
});

app.delete('/events/:msg', (req, res) => {
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

// -----------------------------------------------------------------------------
// راه‌اندازی سرور
// -----------------------------------------------------------------------------
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

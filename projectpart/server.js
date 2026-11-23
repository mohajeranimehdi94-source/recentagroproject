const path =require('path');
const express =require('express');
const sqlite3 =require('sqlite3').verbose();
const router =express.Router();
const DB_PATH=path.join(__dirname,'data.db');
const db = new sqlite3.Database(DB_PATH,(err)=>{
    if(err){console.error('failed')}else{console.log('conected')}
});
db.run(`CREATE TABLE IF NOT EXISTS serials (
  name TEXT,
  barcode TEXT,
  code TEXT ,
  groupp TEXT ,
  price NUMBER
)`);

router.use(express.json());

router.get('/parts', (req, res) => {
    const sql = 'SELECT * FROM serials';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Database error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});
router.post('/price',(req,res)=>{
    console.log(req.body)
    const code =req.body.code;
    const price =req.body.price;
    const date=req.body.date;
    const time =req.body.time;
    const sql = 'UPDATE serials SET price= ?,date=?,time=? WHERE code= ?';
    db.run(sql,[price,date,time,code],(err)=>{
        if(err){return res.status(500).json({messege:'خطا در دیتابیس'})}
        res.json({messege:'موفق'})
    })

})

router.post('/editprice', async (req, res) => {
  const values = req.body; // آرایه
  console.log(values)
  try {
    await Promise.all(values.map(v => {
      return new Promise((resolve, reject) => {
        const sql = 'UPDATE serials SET price= ?,date=?,time=? WHERE code= ?';
        db.run(sql, [v.price,v.date,v.time,v.code], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }));
    res.json({ message: 'موفق' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطا در دیتابیس' });
  }
});

module.exports=router;
//
function toMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}
//کانفیرم
let confirmResolve;

function customConfirm(message) {
  const confirmBox = document.getElementById("confirmBox");
  const confirmMsg = document.getElementById("confirmMessage");

  confirmMsg.textContent = message;
  confirmBox.style.display = "block";

  return new Promise((resolve) => {
    confirmResolve = resolve;
  });
}

function confirmYes() {
  document.getElementById("confirmBox").style.display = "none";
  confirmResolve(true);
}

function confirmNo() {
  document.getElementById("confirmBox").style.display = "none";
  confirmResolve(false);
}

//پنجره اخطار
function showError(message, duration = 3000) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = message;
  errorBox.style.display = "block";

  setTimeout(() => {
    errorBox.style.display = "none";
  }, duration);
}
//
function showErrorOne(message, duration = 3000) {
  const errorBox = document.getElementById("errorBox1");
  errorBox.textContent = message;
  errorBox.style.display = "block";

  setTimeout(() => {
    errorBox.style.display = "none";
  }, duration);
}

// -------------------- ارجاعات DOM --------------------
const form = document.getElementById('reservationForm');
const vehicleSelect = document.getElementById('vehicleType');
const dateSelect = document.getElementById('date');
const tableBody = document.querySelector('#reservationTable tbody');
// -------------------- بارگذاری وسایل نقلیه --------------------
fetch('/p1/api/jalali-dates')
.then(res => res.json())
.then(date2=>{
  console.log(date2);
    const date1=date2[0];
    const date3=date1.date.toString().replace(/\s*\/\s*/g, ".");
  const day =date1.weekday;
 const day1=day;
const today=document.getElementById("div1");
today.textContent=` امروز:  ${day1}   تاریخ:  ${date3}`;})

function time() {
  const saat = document.getElementById("h2");
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  saat.textContent = `${hours}:${minutes}:${seconds}`;

}
setInterval(time,1000);
async function loadVehicles() {
  try {
    const res = await fetch('/p1/vehicles');
    if (!res.ok) throw new Error('خطا در دریافت وسایل نقلیه');
    const vehicles = await res.json();
    vehicleSelect.innerHTML = '';
    vehicles.forEach(v => {
      const option = document.createElement('option');
      option.value =v.vehicleType;
      option.textContent = `${v.vehicleType}`;
      vehicleSelect.appendChild(option);
    });
  } catch (e) {
    alert(e.message);
  }
}

// -------------------- تولید فهرست تاریخ‌های شمسی --------------------
function populateDateOptions() {
  fetch('/p1/api/jalali-dates')
    .then(res => {
      if (!res.ok) throw new Error('خطا در دریافت تاریخ‌ها');
      return res.json();
    })
    .then(dates => {
      dateSelect.innerHTML = '';
      dates.forEach(item => {
        const option = document.createElement('option');
        option.value = item.date;
        option.textContent = `${item.weekday} - ${item.date}`;
        dateSelect.appendChild(option);
      });
    })
    .catch(err => {
      alert('دریافت تاریخ‌ها از سرور ناموفق بود');
      console.error(err);
    });
}

// -------------------- بارگذاری رزروها --------------------

const sortOrderSelect = document.getElementById('sortOrder');
const filterDateSelect = document.getElementById('filterDate');
const applyFilterBtn = document.getElementById('applyFilter');
const clearFilterBtn = document.getElementById('clearFilter');

// دادهٔ اصلی رزروها
let allReservations = [];

/* ---------- گرفتن داده‌ها از سرور ---------- */
function loadReservations() {
  fetch('/p1/reservations')
    .then(res => res.json())
    .then(data => {
      allReservations = data;
      populateDateFilter(data);
      applySortAndFilter();
    })
    .catch(err => console.error('خطا در دریافت رزروها:', err));
}

/* ---------- پرکردن سلکت تاریخ منحصربه‌فرد ---------- */
function populateDateFilter(data) {
  const uniqueDates = [...new Set(data.map(r => r.date))];
  filterDateSelect.innerHTML = '<option value="">-- همه تاریخ‌ها --</option>';

  uniqueDates
    .sort((a, b) => new Date(b) - new Date(a)) // جدید به قدیم
    .forEach(date => {
      const option = document.createElement('option');
      option.value = date;
      option.textContent = date;
      filterDateSelect.appendChild(option);
    });
}

/* ---------- مرتب‌سازی و فیلتر ---------- */
function applySortAndFilter() {
  const order = sortOrderSelect.value;      // asc | desc
  const selectedDate = filterDateSelect.value;

  // فیلتر بر اساس تاریخ
  let displayed = selectedDate
    ? allReservations.filter(r => r.date === selectedDate)
    : [...allReservations];

  // مرتب‌سازی
  displayed.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return order === 'asc' ? da - db : db - da;
  });

  renderReservations(displayed);
}

/* ---------- ساختن ردیف‌های جدول ---------- */
function renderReservations(data) {
  

  fetch('/p1/vehicles')
    .then(res => res.json())
    .then(vehicles => {
      tableBody.innerHTML = '';
      data.forEach(r => {
        
       // const car = r.vehicleType;
       // const vehicleInfo = vehicles.find(v => v.vehicleType === car);
        const duration = r.duration;
        //vehicleInfo ? vehicleInfo.duration : 0;

        const loadingTime = r.loadingTime; // فرض: به‌صورت "HH:mm"
        const loadingMinutes = toMinutes(loadingTime); // تابع تبدیل زمان به دقیقه
        const endMinutes = loadingMinutes + duration;

        const endHour = Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;
        const formattedEnd = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
        // فایل برچسب
        let labelContent = 'ندارد';
        if (r.shahriLabelFile) {
          labelContent = `<a href="${r.shahriLabelFile}" target="_blank">دانلود برچسب</a>`;
        } else if (r.vehicleType === 'شهری') {
          labelContent = `
            <form onsubmit="return uploadShahriLabel(event, ${r.id})" class="upload-form">
              <input type="file" name="documentsh" accept=".ezpx" required>
              <button type="submit">📤 بارگذاری فایل</button>
            </form>`;
        }

        // فایل حواله
        let fileCellContent = '';
        let replaceFileCellContent = '';
        console.log(r.fileName);
        if (r.fileName) {
          fileCellContent = `
            <a href="${r.fileName}" target="_blank">دانلود</a>
            <button type="button" onclick="deleteFile(${r.id})">حذف فایل</button>`;
        } else {
          fileCellContent = 'حواله انبار ویرایش شده';
          replaceFileCellContent = `
            <form onsubmit="return uploadFile(event, ${r.id})" class="upload-form">
              <input type="file" name="document" accept=".pdf,.jpg,.jpeg,.png" required>
              <button type="submit">📤 بارگذاری فایل</button>
            </form>`;
        }

        // ساخت ردیف جدول
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.date}</td>
          <td>${r.customerName}</td>
          <td>${r.destinationCity}</td>
          <td>
            <div>${r.vehicleType}</div>
            <div style="font-size: 0.8em; color: blue;">${duration} دقیقه</div>
          </td>
          <td>${r.loadingTime}</td>
          <td>${formattedEnd}</td>
          <td>${fileCellContent}</td>
          <td>${replaceFileCellContent}</td>
          <td>${labelContent}</td>
          <td>
            <button type="button" onclick="deleteReservation(${r.id})">🗑️ حذف رزرو</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      fetchAndShowEvents();
    });
}



/* ---------- اتصال رویدادها ---------- */
sortOrderSelect.addEventListener('change', applySortAndFilter);
applyFilterBtn.addEventListener('click', applySortAndFilter);
clearFilterBtn.addEventListener('click', () => {
  filterDateSelect.value = '';
  applySortAndFilter();
});

/* ---------- فراخوانی اولیه ---------- */
document.addEventListener('DOMContentLoaded', loadReservations);

// -------------------- عملیات فایل --------------------
function deleteFile(id) {
  fetch('/p1/delete-reservation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, deleteType: 'file' })
  })
  .then(res => res.json().then(data => ({ status: res.status, body: data })))
  .then(({ status, body }) => {
    if (status !== 200) throw body;
    loadReservations();
    fetchAndShowEvents();
  })
  .catch(err => showError(err.error || "خطایی رخ داده است"));
}

async function deleteReservation(id) {
  const confirmed = await customConfirm("آیا از حذف این رزرو مطمئن هستید؟");
  if (!confirmed) return;

  fetch('/p1/delete-reservation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, deleteType: 'all' })
  })
  .then(res => res.json().then(data => ({ status: res.status, body: data })))
  .then(({ status, body }) => {
    if (status !== 200) throw body;
    loadReservations();
    fetchAndShowEvents();
  })
  .catch(err => showError(err.error || "خطایی رخ داده است"));
}

function uploadFile(event, id) {
  event.preventDefault();
  const input = event.target.querySelector('input[type="file"]');
  if (!input.files.length) return alert('فایلی انتخاب نشده است');
  const formData = new FormData();
  formData.append('document', input.files[0]);
  formData.append('id', id);
  fetch('/p1/replace-file', { method: 'POST', body: formData })
    .then(() => {
      loadReservations();
      fetchAndShowEvents();
    });
  return false;
}

function uploadShahriLabel(event, id) {
  event.preventDefault();
  const input = event.target.querySelector('input[type="file"]');
  if (!input.files.length) return alert('فایلی انتخاب نشده');
  const formData = new FormData();
  formData.append('documentsh', input.files[0]);
  formData.append('id', id);
  fetch(`/p1/upload/shahri-label/${id}`, { method: 'POST', body: formData })
    .then(() => {
      loadReservations();
      fetchAndShowEvents();
    });
  return false;
}
//تابع گرفتن تاریخ

// -------------------- ثبت رزرو جدید --------------------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const requestedVehicle = formData.get('vehicleType')?.trim();
  const requestedDate = formData.get('date');
  const requestedTimeStr = formData.get('loadingTime');
  const requestedMin = toMinutes(requestedTimeStr);
const we =document.querySelector("#customerID");
 let durationObj ;
 let requestedDuration;
let wt;
if(we){wt =we.value;}
console.log(wt);
//
  if (!formData.get('customerName') || !formData.get('destinationCity') || !requestedVehicle || !requestedTimeStr || !requestedDate) {
    alert('لطفاً همه فیلدها را پر کنید.');
    return;
  }
//if (!formData.get('fileInput')){showError("لطفا حواله انبار را انتخاب کنید"); return;}

  //
  // گرفتن تاریخ امروز از سرور
  let todayCompare;
  try {
    const dateRes = await fetch('/p1/api/jalali-dates');
    if (!dateRes.ok) throw new Error('خطا در دریافت تاریخ');
    const dateData = await dateRes.json();
    todayCompare = dateData[0].date;
  } catch (err) {
    console.error(err);
    alert('خطا در بررسی تاریخ فعلی');
    return;
  }

  // مقایسه تاریخ و زمان فعلی
  const date1 = requestedDate.toString().replace(/\s*\/\s*/g, "");
  const time1 = requestedTimeStr.toString().replace(/:/g, "");

  const todayCompare1 = todayCompare.toString().replace(/\s*\/\s*/g, "");
  const now = document.getElementById("h2").textContent; // مثلاً ساعت فعلی 14:32
  const now1 = now.toString().replace(/:/g, "");

  if (date1 === todayCompare1 && now1 > time1) {
    showError("قبل از زمان فعلی نمی‌توانید رزروی ثبت کنید");
    return; // ✅ حالا اینجا اجرای کل تابع قطع میشه
  }


  //

  let reservations = [], vehicleTimes = [],savelist=[];
  try {
    const [res1, res2,res3] = await Promise.all([
      fetch('/p1/reservationscheck'),
      fetch('/p1/vehicles'),
      fetch('/p2/sendsaved')
    ]);
    if (!res1.ok || !res2.ok) throw new Error('خطا در واکشی اطلاعات');
    reservations = await res1.json();
    vehicleTimes = await res2.json();
    savelist = await res3.json();
  } catch (err) {
    console.error(err);
    alert('خطا در دریافت اطلاعات از سرور');
    return;
  }
if(we){durationObj= savelist.find(s=>s.cpid===wt)}else{
   durationObj = vehicleTimes.find(v => v.vehicleType === requestedVehicle);};
  if (!durationObj) {
    alert('مدت بارگیری برای این وسیله تعریف نشده است');
    return;
  }

  if(we){requestedDuration=durationObj.v}else{requestedDuration = durationObj.duration;}
  // const allowConflict = durationObj.allowConflict; // حذف شده چون در دیتابیس نداریم
  const requestedEnd = requestedMin + requestedDuration;

  const hasConflict = reservations.some(r => {
    if (r.date !== requestedDate) return false;
    const rVehicle = r.vehicleType;
    const rDurObj = vehicleTimes.find(v => v.vehicleType === rVehicle);
    if (!rDurObj) return false;

    // if (allowConflict && rDurObj.allowConflict) return false; // حذف شده

    const rMin = toMinutes(r.loadingTime);
    const rEnd = rMin + r.duration;
    return (requestedMin < rEnd && rMin < requestedEnd);
  });

  if (hasConflict) {
    showError("در این بازه زمانی رزرو دیگری وجود دارد.");
    return;
  }

  try {
    formData.append("du",JSON.stringify({dur:requestedDuration}))
    const res = await fetch('/p1/upload-reservation', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'خطای ناشناخته در ذخیره رزرو');
    }

    showErrorOne('رزرو با موفقیت ثبت شد.');
    form.reset();
    loadReservations();
    ress();
    fetchAndShowEvents();
  } catch (err) {
    console.error(err);
    showError('خطا در ثبت رزرو: ' + err.message);
  }
});

// تابع نمایش پاپ‌آپ رویدادها (بدون تغییر)
function showPluginPopup(events) {
  if (!events.length) return;

  const existingPopup = document.querySelector('.plugin-popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.className = 'plugin-popup';
  popup.innerHTML = `
    <div class="popup-header">📢 رویدادهای سیستم</div>
    <div class="popup-list">
      ${events.map(e => `
        <div class="popup-item">
          <span>${e}</span>
          <button class="popup-delete" data-msg="${encodeURIComponent(e)}">❌</button>
        </div>
      `).join('')}
    </div>
    <input type="text" class="popup-input" placeholder="افزودن  پیام">
    <button class="popup-add">➕ افزودن</button>
    <button class="popup-close">بستن</button>
  `;
  document.body.appendChild(popup);

  popup.querySelector('.popup-close').onclick = () => popup.remove();

  popup.querySelectorAll('.popup-delete').forEach(btn => {
    btn.onclick = () => {
      const msg = btn.getAttribute('data-msg');
      fetch(`/p1/events/${msg}`, { method: 'DELETE' })
        .then(() => {
          btn.closest('.popup-item').remove();
          const remaining = popup.querySelectorAll('.popup-item');
          if (remaining.length === 0) popup.remove();
        });
    };
  });

  popup.querySelector('.popup-add').onclick = () => {
    const input = popup.querySelector('.popup-input');
    const msg = input.value.trim();
    if (!msg) return;
    fetch('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    }).then(() => location.reload());
  };
}

// تابع فراخوانی رویدادها از سرور (بدون تغییر)
function fetchAndShowEvents() {
  fetch('/p1/events')
    .then(res => {
      if (!res.ok) throw new Error('خطا در دریافت رویدادها');
      return res.json();
    })
    .then(events => showPluginPopup(events))
    .catch(err => console.error('خطا در بارگذاری رویدادها:', err));
}

// -------------------- اجرای اولیه --------------------
window.addEventListener('DOMContentLoaded', () => {
  populateDateOptions();
  loadVehicles();
  loadReservations();
  fetchAndShowEvents();
  setInterval(loadReservations, 120000);
});

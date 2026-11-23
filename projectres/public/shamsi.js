// تبدیل تاریخ میلادی به شمسی (تقویم جلالی)
function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, (gy % 4 === 0 && gy % 100 !== 0 || gy % 400 === 0) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  let days = (365 * gy) + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
  for (let i = 0; i < gm; ++i) days += g_d_m[i];
  days += gd - 1;

  let j_day_no = days - 79;
  let j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;

  jy += 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no %= 1461;

  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }

  const j_months = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let jm, jd;
  for (jm = 0; jm < 12 && j_day_no >= j_months[jm]; ++jm) {
    j_day_no -= j_months[jm];
  }
  jd = j_day_no + 1;

  return { jy, jm: jm + 1, jd };
}

// تبدیل تاریخ شمسی به میلادی
function jalaliToGregorian(jy, jm, jd) {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;

  let days = (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4);
  for (let i = 0; i < jm - 1; ++i)
    days += [31,31,31,31,31,31,30,30,30,30,30,29][i];
  days += jd - 1;

  let g_day_no = days + 79;

  gy += 400 * Math.floor(g_day_no / 146097);
  g_day_no %= 146097;

  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * Math.floor(g_day_no / 36524);
    g_day_no %= 36524;
    if (g_day_no >= 365) g_day_no++;
    else leap = false;
  }

  gy += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;

  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += Math.floor(g_day_no / 365);
    g_day_no %= 365;
  }

  const sal_a = [0,31,(leap ? 29 : 28),31,30,31,30,31,31,30,31,30,31];
  let gm;
  for (gm = 0; gm < 13; gm++) {
    if (g_day_no < sal_a[gm]) break;
    g_day_no -= sal_a[gm];
  }

  let gd = g_day_no + 1;
  return [gy, gm, gd];
}

// افزودن صفر قبل از عددهای تک‌رقمی
function pad(n) {
  return n < 10 ? '0' + n : n;
}

// تبدیل تاریخ شمسی به رشته yyyy/mm/dd
function jalaliToString(j) {
  return `${j.jy}/${pad(j.jm)}/${pad(j.jd)}`;
}

// گرفتن تاریخ امروز میلادی با در نظر گرفتن اختلاف زمانی ایران
function getTodayGregorian() {
  const date = new Date();
  date.setHours(date.getHours() + 4.5); // جبران اختلاف ساعت با ایران
  return date;
}

// تبدیل تاریخ امروز میلادی به شمسی
function getTodayJalali() {
  const today = getTodayGregorian();
  return gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

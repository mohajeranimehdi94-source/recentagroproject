window.saveReservationsAsXML = async function () {
  const response = await fetch('/reservations');
  if (!response.ok) {
    alert('خطا در خواندن فایل رزروها');
    return;
  }

  const reservations = await response.json();

  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<reservations>\n';
  reservations.forEach(r => {
    xmlContent += `  <reservation>\n`;
    xmlContent += `    <تاریخ>${r.date}</تاریخ>\n`;
    xmlContent += `    <نام>${r.customerName}</نام>\n`;
    xmlContent += `    <شهر>${r.destinationCity}</شهر>\n`;
    xmlContent += `    <وسیله>${r.vehicleType}</وسیله>\n`;
    xmlContent += `    <ساعت>${r.loadingTime}</ساعت>\n`;
    xmlContent += `    <fileName>${r.fileName || ''}</fileName>\n`;
    xmlContent += `  </reservation>\n`;
  });

  xmlContent += '</reservations>';

  // ساخت فایل و دانلود
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'reservations.xml';
  link.click();
  URL.revokeObjectURL(link.href);
};

// const percent = document.getElementById("percent");

setInterval(() => {
  const monthStart = parseInt(document.getElementById("monthStart").value)-1;
  const dayStart = parseInt(document.getElementById("dayStart").value);
  const yr1 = parseInt(document.getElementById("yearStart").value);
  const yr2 = parseInt(document.getElementById("yearEnd").value);
  const monthEnd = parseInt(document.getElementById("monthEnd").value)-1;
  const dayEnd = parseInt(document.getElementById("dayEnd").value);
  const dateStart = new Date(yr1, monthStart, dayStart);
  const dateEnd = new Date(yr2, monthEnd, dayEnd);
  const dateStartMillis = dateStart.getTime();
  const dateEndMillis = dateEnd.getTime();
  const now = Date.now()-dateStartMillis;
  document.getElementById("percent").innerHTML = (now/(dateEndMillis-dateStartMillis))*100+"%";
}, 20)

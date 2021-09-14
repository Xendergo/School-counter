if (("Notification" in window) && Notification.permission != "granted") {
  Notification.requestPermission()
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then(function () {
      console.log('Service Worker Registered');
    });
} // Also borrowed from MDN

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const c = document.getElementById("c");
const draw = c.getContext("2d")

const palette = {
  line: () => {
    return `hsl(${color}, 100%, 50%)`
  },
  background: () => {
    return `hsl(0, 0%, 100%, 0)`;
  }
}
let points = 200;
let multiplier = 0;
let cs = [125, 276];
let color = cs[0]
let cnv;
let pm = 0;
const mod = (x, n) => (x % n + n) % n;
let updater;
let dateStartMillis, dateEndMillis;
let measurement;
let radios = document.getElementsByName("measure");
let date = new Date()
let base;

function setup() {
  c.width = window.innerHeight * 0.85;
  c.height = window.innerHeight * 0.85;
  updater = new Worker("./updater.js");
  updater.onmessage = function (e) {
    if (e.data == "Set Favicon") {
      setFavicon()
    } else {
      document.getElementById("title").innerHTML = "School counter | " + e.data.toString(base) + "%"
    }
  }

  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      measurement = radios[i].value;
    }
  }

  drawLoop();
}

function drawLoop() {
  setTimeout(drawLoop, 1000 / 60);
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      measurement = radios[i].value;
    }
  }

  base = parseInt(document.getElementById("base").value)

  points = base ** 2 * 2

  const monthStart = getNumValue("monthStart") - 1;
  const dayStart = getNumValue("dayStart");
  const hourStart = getNumValue("hourStart");
  const minuteStart = getNumValue("minuteStart");
  const yr1 = getNumValue("yearStart");
  const yr2 = getNumValue("yearEnd");
  const monthEnd = getNumValue("monthEnd") - 1;
  const dayEnd = getNumValue("dayEnd");
  const hourEnd = getNumValue("hourEnd");
  const minuteEnd = getNumValue("minuteEnd");
  const preview = document.getElementById("preview").checked;
  let dateStart;
  let dateEnd;

  if (measurement == "year") {
    dateStart = new Date(yr1, monthStart, dayStart, hourStart, minuteStart);
    dateEnd = new Date(yr2, monthEnd, dayEnd, hourEnd, minuteEnd);
  } else if (measurement == "week") {
    dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - 1), hourStart, minuteStart);
    dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - date.getDay() - 1), hourEnd, minuteEnd);
  } else {
    dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hourStart, minuteStart);
    dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hourEnd, minuteEnd);
  }
  dateStartMillis = dateStart.getTime();
  dateEndMillis = dateEnd.getTime();

  const now = Date.now() - dateStartMillis;
  multiplier = (now / (dateEndMillis - dateStartMillis)) * base ** 2;
  let point = getNumValue("point", base);
  let nextPercentagePoint = new Date((dateEndMillis - dateStartMillis) * (point / base ** 2) + dateStartMillis);
  let notifyMod = getNumValue("notify", base);
  let morning = "AM"
  if (nextPercentagePoint.getHours() > 12) {
    morning = "PM"
  }


  document.getElementById("nextPercentagePoint").innerHTML = `% happening at: ${Math.round(mod((nextPercentagePoint.getHours() - 0.1), 12))}:${("0" + nextPercentagePoint.getMinutes()).slice(-2)} ${morning}, ${monthNames[nextPercentagePoint.getMonth()]} ${nextPercentagePoint.getUTCDate()} `;
  multiplier = (now / (dateEndMillis - dateStartMillis)) * base ** 2;

  if (Math.floor(pm / notifyMod) * notifyMod !== Math.floor(multiplier / notifyMod) * notifyMod && pm !== 0) {
    notify(`School is ${Math.floor(multiplier * base ** 3) / base ** 3}% over!`);
  }

  pm = multiplier;
  document.getElementById("percent").innerHTML = multiplier.toString(base) + "%";
  if (document.getElementById("roundTable").checked) {
    document.getElementById("roundValue").hidden = false;
    let roundValue = getNumValue("roundValue", base);
    multiplier = Math.round(multiplier / roundValue) * roundValue;
  } else {
    document.getElementById("roundValue").hidden = true;
  }
  document.getElementById("multiplier").innerHTML = `x${multiplier.toString(base)}`
  document.getElementById("percent").width = c.windowWidth / 2;

  if (preview) {
    multiplier = getNumValue("point", base);
  }

  drawCircle();

  cs[1] = Math.sin(multiplier * 50) * 100 + 200;
  cs[0] = cs[1] - 100;
  if (performance.now() < 1000) {
    setFavicon();
  }
}

function polarToCart(v) {
  return [v[1] * Math.cos(v[0]), v[1] * Math.sin(v[0])];
}

function drawCircle() {
  draw.save();
  draw.clearRect(0, 0, c.width, c.height);
  draw.translate(c.width / 2, c.height / 2);
  for (let i = 0; i < points; i++) {
    draw.fillStyle = palette.line();
    color = (i / points) * (cs[1] - cs[0]) + cs[0]
    let p = polarToCart([i / points * Math.PI * 2, c.width * 0.48]);
    let p2 = polarToCart([i / points * Math.PI * 2 * multiplier, c.width * 0.48]);
    draw.strokeStyle = palette.line();
    draw.lineWidth = c.width / (1640 / 3);
    draw.beginPath();
    draw.moveTo(p[0], p[1]);
    draw.lineTo(p2[0], p2[1]);
    draw.stroke();

    draw.beginPath();
    draw.arc(p[0], p[1], c.height / 512, 0, Math.PI * 2);
    draw.fill();
  }
  draw.restore();
}

function savey() {
  // console.log(temp)
  c.width = 1080;
  c.height = 1080;

  drawCircle();

  document.getElementById("downloadLink").href = c.toDataURL();
  document.getElementById("downloadLink").download = `x${multiplier}.png`;
  document.getElementById("downloadLink").click();

  c.width = window.innerHeight;
  c.height = window.innerHeight;
}

function notify(msg) {
  if (Notification.permission == "granted") {
    new Notification(msg)
  } else {
    console.log(Notification.permission)
  }
}

setInterval(() => {
  updater.postMessage([dateStartMillis, dateEndMillis, base]);
}, 3000)

setInterval(() => {
  if ((new Date()).getDate() !== date.getDate()) {
    date = new Date();
  }
}, 60000);

function getNumValue(id, base = 10) {
  let v = parseFloatWithRadix(document.getElementById(id).value, base);

  if (isNaN(v)) {
    return 0;
  } else {
    return v;
  }
}

const setFavicon = () => {
  let link = document.getElementById("favicon");
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = c.toDataURL("image/x-icon");
}

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

// https://stackoverflow.com/questions/8555649/second-argument-to-parsefloat-in-javascript
function parseFloatWithRadix(s, r) {
  r = (r||10)|0;
  const [b,a] = ((s||'0') + '.').split('.');
  const l1 = parseInt('1'+(a||''), r).toString(r).length;
  return parseInt(b, r) + 
    parseInt(a||'0', r) / parseInt('1' + Array(l1).join('0'), r);
}

setup();
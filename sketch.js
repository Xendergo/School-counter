if (("Notification" in window) && Notification.permission != "granted") {
  Notification.requestPermission()
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/pwa-examples/a2hs/sw.js')
    .then(function () {
      console.log('Service Worker Registered');
    });
} // Also borrowed from MDN

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const palette = {
  line: () => {
    return color(c, 100, 100)
  },
  background: () => {
    return color(0, 0, 100, 0);
  }
}
let points = 200;
let multiplier = 0;
let cs = [125, 276];
let c = cs[0];
let cnv;
let pm = 0;
const mod = (x, n) => (x % n + n) % n;
let updater;
let dateStartMillis, dateEndMillis;

function setup() {
  colorMode(HSB)
  cnv = createCanvas(windowHeight, windowHeight);
  textFont("Ubuntu");
  updater = new Worker("./updater.js");
  updater.onmessage = function (e) {
    if (e.data == "Set Favicon") {
      setFavicon()
    } else {
      document.getElementById("title").innerHTML = "School counter | " + e.data + "%"
    }
  }
}

function draw() {
  select("#tableSettings").position(0, 0);
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
  const dateStart = new Date(yr1, monthStart, dayStart, hourStart, minuteStart);
  const dateEnd = new Date(yr2, monthEnd, dayEnd, hourEnd, minuteEnd);
  dateStartMillis = dateStart.getTime();
  dateEndMillis = dateEnd.getTime();

  const now = Date.now() - dateStartMillis;
  multiplier = (now / (dateEndMillis - dateStartMillis)) * 100;
  let point = document.getElementById("point");
  let nextPercentagePoint = new Date((dateEndMillis - dateStartMillis) * (point.value / 100) + dateStartMillis);
  let notifyMod = document.getElementById("notify").value;
  let morning = "AM"
  if (nextPercentagePoint.getHours() > 12) {
    morning = "PM"
  }
  document.getElementById("nextPercentagePoint").innerHTML = `% happening at: ${Math.round(mod((nextPercentagePoint.getHours() - 0.1), 12))}:${("0" + nextPercentagePoint.getMinutes()).slice(-2)} ${morning}, ${monthNames[nextPercentagePoint.getMonth()]} ${nextPercentagePoint.getUTCDate()} `;
  multiplier = (now / (dateEndMillis - dateStartMillis)) * 100;
  if (Math.floor(pm / notifyMod) * notifyMod !== Math.floor(multiplier / notifyMod) * notifyMod && pm !== 0) {
    notify(`School is ${Math.floor(multiplier * 10000) / 10000}% over!`);
    console.log("Notify")
  }
  pm = multiplier;
  document.getElementById("percent").innerHTML = multiplier + "%";
  if (select("#roundTable").elt.checked) {
    select("#roundValue").elt.hidden = false
    multiplier = Math.round(multiplier / select("#roundValue").value()) * select("#roundValue").value();
  } else {
    select("#roundValue").elt.hidden = true
  }
  select("#multiplier").elt.innerHTML = `x${multiplier}`
  // console.log(multiplier);
  select("#percent").elt.width = windowWidth / 2;
  // background(palette.background())
  clear()
  translate(width / 2, height / 2.5);
  textSize(width / (410 / 11));
  for (let i = 0; i < points; i++) {
    fill(palette.line());
    c = (i / points) * (cs[1] - cs[0]) + cs[0]
    let p = polarToCart([i / points * PI * 2, width * 0.4]);
    let p2 = polarToCart([i / points * PI * 2 * multiplier, width * 0.4]);
    stroke(palette.line());
    strokeWeight(width / (1640 / 3))
    line(p[0], p[1], p2[0], p2[1]);
    noStroke()
    ellipse(p[0], p[1], width / 256, height / 256);
  }
  cs[1] = sin(multiplier * 50) * 100 + 200;
  cs[0] = cs[1] - 100;
  if (millis() < 1000) {
    setFavicon()
  }
}

function polarToCart(v) {
  return [v[1] * cos(v[0]), v[1] * sin(v[0])];
}

function savey() {
  let temp = cnv.position();
  // console.log(temp)
  resizeCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  clear();
  translate(-width / 2, -height / 2.5);
  translate(width / 2, height / 2)
  textSize(width / (410 / 11));
  for (let i = 0; i < points; i++) {
    fill(palette.line());
    c = (i / points) * (cs[1] - cs[0]) + cs[0]
    let p = polarToCart([i / points * PI * 2, height * 0.45]);
    let p2 = polarToCart([i / points * PI * 2 * multiplier, height * 0.45]);
    stroke(palette.line());
    strokeWeight(height / (1640 / 2.5))
    line(p[0], p[1], p2[0], p2[1]);
    noStroke()
    ellipse(p[0], p[1], height / 256, height / 256);
  }
  saveCanvas(cnv, `x${multiplier}`, "png")
  translate(-width / 2, -height / 2);
  translate(width / 2, height / 2.5);
  resizeCanvas(windowHeight, windowHeight);
  cnv.position(temp.x, temp.y)
}

function notify(msg) {
  if (Notification.permission == "granted") {
    new Notification(msg)
  } else {
    console.log(Notification.permission)
  }
}

setInterval(() => {
  updater.postMessage([dateStartMillis, dateEndMillis]);
}, 3000)

function getNumValue(id) {
  let v = parseInt(document.getElementById(id).value);

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
  link.href = canvas.toDataURL("image/x-icon");
}
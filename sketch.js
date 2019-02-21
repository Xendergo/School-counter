const palette = {
  line: () => {
    return color(c, 100, 100)
  },
  background: () => {
    return color(0, 0, 100);
  }
}
let points = 200;
let multiplier = 0;
let cs = [125, 276]
let c = cs[0];

function setup() {
  colorMode(HSB)
  createCanvas(windowHeight, windowHeight);
  textFont("Ubuntu")
}

function draw() {
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
  multiplier = (now/(dateEndMillis-dateStartMillis))*100
  document.getElementById("percent").innerHTML = multiplier+"%";
  background(palette.background())
  translate(width / 2, height / 2.5);
  textSize(width / (410 / 11));
  for (let i = 0; i < points; i++) {
    fill(palette.line());
    c = (i / points) * (cs[1] - cs[0]) + cs[0]
    let p = polarToCart([i / points * PI * 2, width * 0.35]);
    let p2 = polarToCart([i / points * PI * 2 * multiplier, width * 0.35]);
    stroke(palette.line());
    strokeWeight(width / (1640 / 3))
    line(p[0], p[1], p2[0], p2[1]);
    noStroke()
    ellipse(p[0], p[1], width / 256, height / 256);
  }
  cs[1] = sin(multiplier*50) * 100 + 200;
  cs[0] = cs[1] - 100
}

function polarToCart(v) {
  return [v[1] * cos(v[0]), v[1] * sin(v[0])];
}

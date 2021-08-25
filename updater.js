setInterval(postMessage("Set Favicon"), 10000);
let interval;
let startTime;
let endTime;
let base;

onmessage = function (e) {
    startTime = e.data[0];
    endTime = e.data[1];
    base = e.data[2];
    clearInterval(interval);
    interval = setInterval(() => {
        let now = Date.now();
        let percent = Math.round((((now - (startTime)) / (endTime - startTime)) * base ** 2) * base ** 4) / base ** 4;
        postMessage(percent);
    }, 1000);
}
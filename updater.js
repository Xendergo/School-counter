setInterval(postMessage("Set Favicon"), 10000);
let interval;
let startTime;
let endTime;

onmessage = function (e) {
    startTime = e.data[0];
    endTime = e.data[1];
    clearInterval(interval);
    interval = setInterval(() => {
        let now = Date.now();
        let percent = Math.round((((now - (startTime)) / (endTime - startTime)) * 100) * 100000) / 100000;
        postMessage(percent);
    }, 1000);
}
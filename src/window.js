var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
var video = document.querySelector('video');
var messages = document.querySelector('#messages pre');

function log(message) {
  messages.innerHTML = message;
  document.body.classList.toggle('log', true);
  setTimeout(function() {
    messages.innerHTML = 'Waiting...';
    document.body.classList.toggle('log', false);
  }, 2e3);
}

var waiting = false;

function decodeQr() {
  if (!waiting)
    try {
      qrcode.decode();
    } catch(e) {
      if (e !== "Couldn't find enough finder patterns")
        console.log('QRCode error: ' + e);
    }
  setTimeout(decodeQr, 400);
};

function onDecodedQr(uuid) {
  // If we're not waiting for a NFC Tag, decode.
  if (!waiting) {
    waiting = true;
    log('QRCode detected: ' + uuid);
    sendUuid(uuid, function() {
      waiting = false; 
    });
  }
}

function sendUuid(uuid, callback) {
  var formData = new FormData();
  formData.append('uuid', uuid);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://qrlogger.appspot.com/endpoint');
  xhr.onloadend = function() {
    if (xhr.status !== 200) {
      // Try again later in 30s.
      setTimeout(function() { sendUuid(uuid); }, 30e3);
    }
    callback && callback();
  }
  xhr.send(formData);
}

navigator.webkitGetUserMedia({video: true}, function(stream) {
  video.src = URL.createObjectURL(stream);
  video.addEventListener('loadedmetadata', function() {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    (function draw() {
      context.drawImage(video, 0, 0);
      requestAnimationFrame(draw);
    })();

    qrcode.callback = onDecodedQr;
    decodeQr();
  });
}, function(e) { console.error(e) });

// And because we are so cool...
chrome.power.requestKeepAwake('display');

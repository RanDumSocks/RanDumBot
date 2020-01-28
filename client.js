var canvas  = document.getElementById('canvas-chat');
var c       = canvas.getContext('2d');
var socket  = io.connect();

canvas.width = innerWidth;
canvas.height = innerHeight;

// Listeners
socket.on('drawMessage', function (data) {
  console.log(data);
});

window.addEventListener('resize', function(event) {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  c.beginPath();
  c.rect(5, 5, 10, 10);
  c.stroke();
});

// Setup

c.beginPath();
c.rect(5, 5, 10, 10);
c.stroke();
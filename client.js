var canvas  = document.getElementById('canvas-chat');
var c       = canvas.getContext('2d');
var socket  = io.connect();

resizeWindow(innerWidth, innerHeight);

var instances = [];

// Traps
var trap_windowResize = false;
var trap_newMessages = [];

// Listeners
socket.on('drawMessage', function (data) {
  var receivedMessage = [data.user, data.msg];
  trap_newMessages.push(receivedMessage);
});

window.addEventListener('resize', function(event) {
  resizeWindow(innerWidth, innerHeight);
});

function resizeWindow(width, height) {
  canvas.width = width;
  canvas.height = height;

  windowResize = true;
}

function globalUpdate() {
  window.requestAnimationFrame(globalUpdate);
  c.clearRect(0, 0, innerWidth, innerHeight);

  for (i in instances) {
    instances[i].update();
  }

  // Handle traps
  trap_windowResize = false;
  trap_newMessages = [];
}

// Object Classes
class Object {
  constructor() {
    instances.push(this);

    this.x = 0;
    this.y = 0;
  }

  draw() {}

  update() {
    this.draw();
    if (trap_windowResize) this.globalWindowResize();
    if (trap_newMessages.length > 0) this.globalMessageReceived(trap_newMessages);
  }

  globalWindowResize() {}

  globalMessageReceived(msgs) {}
}

class Text extends Object {
  constructor() {
    super();

    this.fontSize = 30;
    this.font = 'Arial';
    this.text = "test :)\ntwtwt";
    this.x = 5;
    this.y = 5;
  }

  draw() {
    super.draw();
    c.font = this.fontSize.toString() + 'px ' + this.font;
    c.textBaseline = 'top';
    c.fillText(this.text, this.x, this.y);
  }

  update() {
    super.update();
    this.fontSize = textSize;
  }
}

class ChatBar extends Object {
  constructor() {
    super();
    this.textSize = 30;
    this.textLines = 2;
    this.chatHeight = 100;

    this.y = canvas.height - this.chatHeight;
  }

  update() {
    super.update();
  }

  globalWindowResize() {}

  globalMessageReceived(msgs) {
    console.log(msgs);
  }
}

// Setup
globalUpdate();
new ChatBar();

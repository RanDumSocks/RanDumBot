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

/**
 * {@link https://stackoverflow.com/a/3368118|Credit on StackOverflow}
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

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
  constructor(text) {
    super();

    this.fontSize = 30;
    this.font = 'Arial';
    this.text = text;
    this.color = 'black';
    this.x = 5;
    this.y = 5;
  }

  draw() {
    super.draw();
    c.font = this.fontSize.toString() + 'px ' + this.font;
    c.fillStyle = this.color;
    c.textBaseline = 'top';
    c.fillText(this.text, this.x, this.y);
  }

  update() {
    super.update();
  }
}

class ChatBubble extends Object {
  constructor(content) {
    super();
    this.fontSize = 30;
    this.font = 'Arial';
    c.font = this.fontSize.toString() + 'px ' + this.font;
    this.content = content[0] + ": " + content[1];
    this.width = c.measureText(this.content).width;
    this.height = 100;
    this.margin = 10;
    this.padding = [5, 15]; // [t/b, l/r]

    this.innerHeight = this.height - (this.margin * 2) - (this.padding[0] * 2);
    this.innerWidth = this.width - (this.margin * 2) - (this.padding[1] * 2);

    this.textElem = new Text(this.content);
    this.textElem.fontSize = this.fontSize;
    this.textElem.font = this.font;
  }

  draw() {
    c.fillStyle = 'cyan';
    roundRect(c,
              this.x + this.margin,
              this.y + this.margin,
              this.width + (2 * this.padding[1]),
              this.height - (2 * this.margin),
              25,
              true,
              true)
  }

  update() {
    super.update();
    this.textElem.x = this.x + this.margin + this.padding[1];
    this.textElem.y = this.y + this.margin + this.padding[0];
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
    for (var i = 0; i < msgs.length; i += 1) {
      var bubble = new ChatBubble(msgs[i]);
      bubble.height = this.chatHeight;
    }
  }
}

// Setup
globalUpdate();
new ChatBar();

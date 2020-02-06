exports.data = {
  value: 0
}

exports.run = (deltaTime) => {
  this.data.value += deltaTime;

  if (this.data.value >= 5000) {
    //console.log(deltaTime);
    this.data.value = 0;
  }
}
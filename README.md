draw() {
  ctx.save();
  ctx.globalAlpha = this.opacity;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px "Montserrat", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'magenta';
  ctx.shadowBlur = 10;
  ctx.fillText(this.text, this.x, this.y);
  ctx.restore();
}

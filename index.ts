export default class Grid {
  public el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
    this.init();
  }

  init() {
    this.el.innerHTML = '';
    const canvas = this.createCanvas();
    this.el.append(canvas);
  }

  createCanvas() {
    const canvas = document.createElement('canvas');
    const height = this.el.offsetHeight;
    const width = this.el.offsetWidth;
    const dpr = window.devicePixelRatio;
    canvas.style.height = `${height}px`;
    canvas.style.width = `${width}px`;
    if (dpr !== 1) {
      canvas.setAttribute('width', `${Math.round(width * dpr)}`);
      canvas.setAttribute('height', `${Math.round(height * dpr)}`);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
    return canvas;
  }
}

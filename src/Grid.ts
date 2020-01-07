// import 'core-js'

export default class Grid {

  private readonly el: HTMLElement;
  
  constructor(el: HTMLElement) {
    this.el = el;
    this.init();
  }

  init() {
    const box = document.createElement('div');
    box.style.cssText = 'position: relative; height: 100%; overflow: hidden';
    this.el.appendChild(box);
  }
}

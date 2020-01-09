import { ICellBound } from './Grid';

export default class Select {
  private el?: HTMLElement;

  private box?: HTMLDivElement;

  private borderSize: number = 2;

  private borderColor: string = '#19be6b';

  constructor(el: HTMLElement) {
    this.el = el;
    this.createSelectBox();
  }

  createSelectBox() {
    this.box = document.createElement('div');
    this.box.style.cssText = `
      position: absolute;
      display: none;
      transition: all .3s;
      background: rgba(255, 255, 255, 0);
      border: ${this.borderSize}px solid ${this.borderColor};
      box-sizing: border-box;
      pointer-events: none;`;
    (this.el as HTMLElement).appendChild(this.box);
  }

  move(bound: ICellBound) {
    if (this.box) {
      this.box.style.display = 'block';
      this.box.style.top = `${bound.y - this.borderSize}px`;
      this.box.style.left = `${bound.x - this.borderSize}px`;
      this.box.style.width = `${bound.width + this.borderSize}px`;
      this.box.style.height = `${bound.height + this.borderSize}px`;
    }
  }

  close() {
    if (this.box) {
      this.box.style.display = 'none';
    }
  }

  destroy() {
    if (this.el && this.box) {
      this.el.removeChild(this.box);
      this.el = undefined;
    }
  }
}

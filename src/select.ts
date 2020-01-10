import DefaultConfig from './defaultConfig';
import { ICellBound, ICellConfig } from './Grid';

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
      pointer-events: none;`;
    (this.el as HTMLElement).appendChild(this.box);
  }

  move(bound: ICellBound, cellConfig: ICellConfig) {
    if (this.box) {
      const border = cellConfig?.border ?? DefaultConfig.defaultBorder;
      this.box.style.display = 'block';
      this.box.style.top = `${bound.y - this.borderSize}px`;
      this.box.style.left = `${bound.x - this.borderSize}px`;
      this.box.style.width = `${bound.width - border[0]}px`;
      this.box.style.height = `${bound.height - border[1]}px`;
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

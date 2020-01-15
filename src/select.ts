import DefaultConfig from './defaultConfig';
import { ICellBound, ICellConfig } from './Grid';

export default class Select {
  private el?: HTMLElement;

  private box?: HTMLDivElement;

  private borderSize: number = 2;

  private borderColor: string = '#17A1CA';

  private boundCache?: ICellBound;

  private scrollXCache: number = 0;

  private scrollYCache: number = 0;

  constructor(el: HTMLElement) {
    this.el = el;
    this.createSelectBox();
  }

  createSelectBox() {
    this.box = document.createElement('div');
    this.box.style.cssText = `
      position: absolute;
      display: none;
      background: rgba(255, 255, 255, 0);
      border: ${this.borderSize}px solid ${this.borderColor};
      pointer-events: none;`;
    (this.el as HTMLElement).appendChild(this.box);
  }

  move(bound: ICellBound, cellConfig: ICellConfig, scrollX: number, scrollY: number) {
    if (this.box) {
      this.box.style.transition = 'all .3s';
      this.scrollXCache = scrollX;
      this.scrollYCache = scrollY;
      this.boundCache = bound;
      const border = cellConfig.border;
      this.box.style.display = 'block';
      this.box.style.top = `${bound.y - this.borderSize}px`;
      this.box.style.left = `${bound.x - this.borderSize}px`;
      this.box.style.width = `${bound.width - (border?.size?.[0] ?? DefaultConfig.defaultBorder.size[0])}px`;
      this.box.style.height = `${bound.height - (border?.size?.[1] ?? DefaultConfig.defaultBorder.size[1])}px`;
    }
  }

  scrollRelocation(scrollX: number, scrollY: number) {
    if (this.box && this.box.style.display === 'block') {
      this.box.style.transition = 'none';
      const diffX = scrollX - this.scrollXCache;
      const diffY = scrollY - this.scrollYCache;
      this.box.style.left = `${(this.boundCache as ICellBound).x - this.borderSize - diffX}px`;
      this.box.style.top = `${(this.boundCache as ICellBound).y - this.borderSize - diffY}px`;
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
      this.scrollXCache = 0;
      this.scrollYCache = 0;
      this.boundCache = undefined;
    }
  }
}

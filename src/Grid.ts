import DefaultConfig from './defaultConfig';

interface IGridData {
  options: {},
  rows: [],
  cols: [],
  cells: ICellConfig[][],
}

interface ICellConfig {
  showText: string,
  editText: string,
  border?: [number, number],
  borderColor?: [string, string],
  font?: {
    name?: string,
    size?: number,
    color?: string,
  },
}

export default class Grid {

  private readonly el: HTMLElement;
  private data: IGridData;
  
  constructor(el: HTMLElement, data: IGridData) {
    this.el = el;
    this.data = data;
    this.init();
  }

  init() {
    const box = document.createElement('div');
    box.style.cssText = `position: relative; height: 100%; overflow: hidden; border: 1px solid ${DefaultConfig.defaultBorderColor[0]}`;
    this.el.appendChild(box);

    // create canvas
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', `${box.offsetWidth}`);
    canvas.setAttribute('height', `${box.offsetHeight}`);
    box.appendChild(canvas);

    // render data
    const ctx = canvas.getContext('2d');
    if (ctx) {
      let x: number = 0;
      let y: number = 0;
      this.data.cells.forEach((row, rowIndex) => {
        const height = this.data.rows[rowIndex];
        row.forEach((cellConfig, colIndex) => {
          const width = this.data.cols[colIndex];
          this.renderCell(ctx, x, y, width, height, cellConfig);
          x += width;
        });
        y += height;
        x = 0;
      });
    }
  }

  renderCell(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number,config: ICellConfig) {
    ctx.save();

    // render border
    const border = config.border || DefaultConfig.defaultBorder;
    const borderColor = config.borderColor || DefaultConfig.defaultBorderColor;
    ctx.lineWidth = border[0];
    ctx.strokeStyle = borderColor[0];
    ctx.beginPath();
    const moveX = x + width - ctx.lineWidth / 2;
    ctx.moveTo(moveX, y);
    ctx.lineTo(moveX, y + height);
    ctx.stroke();

    ctx.lineWidth = border[1];
    ctx.strokeStyle = borderColor[1];
    ctx.beginPath();
    const moveY = y + height - ctx.lineWidth / 2;
    ctx.moveTo(x, moveY);
    ctx.lineTo(x + width, moveY);
    ctx.stroke();

    const name = config.font && config.font.name || DefaultConfig.defaultFont.name;
    const size = config.font && config.font.size || DefaultConfig.defaultFont.size;
    ctx.font = `${size}px ${name}`;
    ctx.textBaseline = "top";
    ctx.rect(x, y, width, height);
    ctx.clip();
    const cssSize = this.getTextSize(config.showText, name, size);
    ctx.fillText(config.showText, x, Math.ceil(y + (height - cssSize.height) / 2));

    ctx.restore();
  }

  getTextSize(text: string, name: string, size: number) {
    const span = document.createElement('span');
    span.style.cssText = `display: inline-block; font-family: ${name}; font-size: ${size}px`;
    span.innerText = text;
    document.body.appendChild(span);
    const bound = span.getBoundingClientRect();
    document.body.removeChild(span);
    return bound;
  }
}

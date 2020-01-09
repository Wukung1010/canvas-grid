import DefaultConfig from './defaultConfig';
import Select from './select';
import Editor from './editor';

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

export interface ICellBound {
  rowIndex: number,
  colIndex: number,
  x: number,
  y: number,
  width: number,
  height: number
}

export default class Grid {
  private readonly el: HTMLElement;

  private data: IGridData;

  private selfBox!: HTMLElement;

  private canvas!: HTMLCanvasElement;

  private editor: Editor;

  private select: Select;

  private scrollTop: number = 0;

  private scrollLeft: number = 0;

  constructor(el: HTMLElement, data: IGridData) {
    this.el = el;
    this.data = data;
    this.initEnv();
    this.render();
    this.select = new Select(this.selfBox);
    this.editor = new Editor(this.selfBox);
    this.registerListener();
  }

  initEnv() {
    this.selfBox = document.createElement('div');
    this.selfBox.style.cssText = `position: relative; height: 100%; overflow: hidden; border: 1px solid ${DefaultConfig.defaultBorderColor[0]}`;
    this.el.appendChild(this.selfBox);

    // create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', `${this.selfBox.offsetWidth}`);
    this.canvas.setAttribute('height', `${this.selfBox.offsetHeight}`);
    this.selfBox.appendChild(this.canvas);
  }

  render() {
    // render data
    const ctx = this.canvas.getContext('2d');
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

  /* eslint class-methods-use-this: "off" */
  renderCell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    config: ICellConfig,
  ) {
    ctx.save();

    ctx.clearRect(x, y, width, height);

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

    const name = (config.font && config.font.name) || DefaultConfig.defaultFont.name;
    const size = (config.font && config.font.size) || DefaultConfig.defaultFont.size;
    ctx.font = `${size}px ${name}`;
    ctx.textBaseline = 'middle';
    ctx.rect(x, y, width, height);
    ctx.clip();
    // const cssSize = this.getTextSize(config.showText, name, size);
    ctx.fillText(config.showText, x, y + Math.ceil(height / 2));

    ctx.restore();
  }

  getCellBound(offsetX: number, offsetY: number): ICellBound {
    const bound = {
      rowIndex: 0,
      colIndex: 0,
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    };

    const absoluteX = offsetX + this.scrollLeft;
    this.data.cols.some((col, colIndex) => {
      if (bound.x <= absoluteX && bound.x + col >= absoluteX) {
        bound.width = col;
        bound.colIndex = colIndex;
        return true;
      }
      bound.x += col;
      return false;
    });
    bound.x -= this.scrollLeft;

    const absoluteY = offsetY + this.scrollTop;
    this.data.rows.some((row, rowIndex) => {
      if (bound.y <= absoluteY && bound.y + row >= absoluteY) {
        bound.height = row;
        bound.rowIndex = rowIndex;
        return true;
      }
      bound.y += row;
      return false;
    });
    bound.y -= this.scrollTop;

    return bound;
  }

  getCell(x: number, y: number) {
    return this.data.cells[y][x];
  }

  registerListener() {
    this.selfBox.addEventListener('click', (event) => {
      if (event.target === this.canvas) {
        const { offsetX, offsetY } = event;
        const bound = this.getCellBound(offsetX, offsetY);
        if (this.editor.isEditing()) {
          const editorBound = this.editor.getEditorBound();
          const value = this.editor.close();
          const cell = this.getCell(
            (editorBound as ICellBound).colIndex,
            (editorBound as ICellBound).rowIndex,
          );
          cell.showText = value as string;
          cell.editText = value as string;
          this.render();
        }
        this.select.move(bound);
      }
    }, true);

    this.selfBox.addEventListener('dblclick', (event) => {
      const { offsetX, offsetY } = event;
      const bound = this.getCellBound(offsetX, offsetY);
      const cell = this.getCell(bound.colIndex, bound.rowIndex);
      this.editor.open(
        bound,
        cell.editText,
        (cell.font && cell.font.name) || DefaultConfig.defaultFont.name,
        (cell.font && cell.font.size) || DefaultConfig.defaultFont.size,
      );
    }, true);
  }
}

function getTextSize(text: string, name: string, size: number) {
  const span = document.createElement('span');
  span.style.cssText = `display: inline-block; font-family: ${name}; font-size: ${size}px`;
  span.innerText = text;
  document.body.appendChild(span);
  const bound = span.getBoundingClientRect();
  document.body.removeChild(span);
  return bound;
}

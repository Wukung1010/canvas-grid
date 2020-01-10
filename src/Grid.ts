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

  private canvasBox!: HTMLElement;

  private canvas!: HTMLCanvasElement;

  private editor: Editor;

  private select: Select;

  private scrollTop: number = 0;

  private scrollLeft: number = 0;

  private renderArea: { width: number, height: number } = { width: 0, height: 0 };

  private mouseMoving: boolean = false;

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
    this.selfBox.style.cssText = `position: relative; height: 100%; overflow: hidden;`;
    this.el.appendChild(this.selfBox);

    const scrollSize = 10;
    const boxWidth = this.selfBox.offsetWidth;
    const boxHeight = this.selfBox.offsetHeight;
    const rowTotalSize = this.data.rows.reduce((size, value) => size += value, 0);
    const colTotalSize = this.data.cols.reduce((size, value) => size += value, 0);
    let hasXScrollBar = false;
    let hasYScrollBar = false;

    // check scroll enable
    if (rowTotalSize > boxHeight) {
      hasYScrollBar = true;
      if (colTotalSize > boxWidth - scrollSize) {
        hasXScrollBar = true;
      }
    }
    if (colTotalSize > boxWidth) {
      hasXScrollBar = true;
      if (rowTotalSize > boxHeight - scrollSize) {
        hasYScrollBar = true;
      }
    }

    // create layout
    let canvasHeight = boxHeight - (hasYScrollBar ? scrollSize: 0);
    let canvasWidth = boxWidth - (hasXScrollBar ? scrollSize: 0);

    // create canvas
    this.canvasBox = document.createElement('div');
    this.canvasBox.style.cssText = `
      position: relative;
      float: left;
      box-sizing: border-box;
      border: 1px solid ${DefaultConfig.defaultBorderColor[0]};
      width: ${canvasWidth}px;
      height: ${canvasHeight}px;
    `;
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', `${canvasWidth - 2}`);
    this.canvas.setAttribute('height', `${canvasHeight - 2}`);
    this.canvasBox.appendChild(this.canvas);
    this.selfBox.appendChild(this.canvasBox);

    // create Y scroll
    const scrollStyle = `
      position: relative;
      background: #e6e6e6;
      border: 1px solid #d8d8d8;
      box-sizing: border-box;
      border-radius: 3px;
    `;
    const scrollBlockStyle = `
      position: relative;
      border: 0px;
      background: #ffffff;
      cursor: pointer;
      border-radius: 3px;
    `;
    if (hasYScrollBar) {
      const YScroll = document.createElement('div');
      YScroll.style.cssText = `
        ${scrollStyle}
        float: right;
        width: ${scrollSize}px;
        height: ${canvasHeight}px;
      `;
      const YScrollBlock = document.createElement('div');
      YScrollBlock.style.cssText = `
        ${scrollBlockStyle}
        width: ${scrollSize - 2}px;
        height: ${Math.floor(canvasHeight * canvasHeight / colTotalSize)}px;
      `;
      YScroll.appendChild(YScrollBlock);
      this.selfBox.appendChild(YScroll);
    }

    // create X scroll
    if (hasXScrollBar) {
      let XScrollMoving = false;
      let offset = { top: 0, left: 0 };
      const XScroll = document.createElement('div');
      XScroll.style.cssText = `
        ${scrollStyle}
        clear: both;
        width: ${canvasWidth}px;
        height: ${scrollSize}px;
      `;
      const XScrollBlock = document.createElement('div');
      XScrollBlock.style.cssText = `
        ${scrollBlockStyle}
        width: ${Math.floor(canvasWidth * canvasWidth / rowTotalSize)}px;
        height: ${scrollSize - 2}px;
      `;
      XScrollBlock.addEventListener('mousedown', (event) => {
        XScrollMoving = true;
      });
      document.body.addEventListener('mousemove', (event) => {
        if (XScrollMoving) {
          XScrollBlock.style.left = `${event.x - offset.left}px`;
        }
      });
      XScrollBlock.addEventListener('mouseup', (event) => {
        XScrollMoving = false;
      });
      XScroll.appendChild(XScrollBlock);
      this.selfBox.appendChild(XScroll);
      offset = getElAbsoluteOffset(XScroll);
    }

    this.renderArea.width = this.canvas.offsetWidth;
    this.renderArea.height = this.canvas.offsetHeight;
  }

  render() {
    // render data
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      let x: number = 0;
      let y: number = 0;
      this.data.cells.some((row, rowIndex) => {
        if (this.renderArea.height < y) {
          return true;
        }
        const height = this.data.rows[rowIndex];
        row.some((cellConfig, colIndex) => {
          if (this.renderArea.width < x) {
            return true;
          }
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

    const name = config.font?.name || DefaultConfig.defaultFont.name;
    const size = config.font?.size || DefaultConfig.defaultFont.size;
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
    this.selfBox.addEventListener('mousedown', (event) => {
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

    this.selfBox.addEventListener('mousemove', (event) => {
      if (this.mouseMoving) {
        const { offsetX, offsetY } = event;
        const bound = this.getCellBound(offsetX, offsetY);
      }
    }, true);
    this.selfBox.addEventListener('mouseup', () => {
      this.mouseMoving = false;
    }, true);

    this.selfBox.addEventListener('dblclick', (event) => {
      const { offsetX, offsetY } = event;
      const bound = this.getCellBound(offsetX, offsetY);
      const cell = this.getCell(bound.colIndex, bound.rowIndex);
      this.editor.open(
        bound,
        cell.editText,
        cell.font?.name || DefaultConfig.defaultFont.name,
        cell.font?.size || DefaultConfig.defaultFont.size,
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

function getElAbsoluteOffset(el: HTMLElement) {
  const offset = {
    top: 0,
    left: 0,
  };
  let target: HTMLElement | null = el;
  while(target && target !== document.body) {
    offset.top += target.offsetTop;
    offset.left += target.offsetLeft;
    target = target.parentElement;
  }
  return offset;
}

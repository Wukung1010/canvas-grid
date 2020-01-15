import DefaultConfig from './defaultConfig';
import Select from './select';
import Editor from './editor';
import Util from './util';
import TextRender from './render/textRender';
import BorderRender, { IBorderConfig } from './render/borderRender';

interface IGridData {
  options: {},
  rows: [],
  cols: [],
  cells: ICellConfig[][],
}

export interface ICellConfig {
  showText: string,
  editText: string,
  border?: IBorderConfig,
  font?: ICellFont,
}

export interface ICellFont {
  name?: string,
  size?: number,
  color?: string,
  isBold?: boolean,
  isItalic?: boolean,
  isFitSize?: boolean,
  isWrapLine?: boolean,
  vertical?: number,
  horizontal?: number,
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

  private editor!: Editor;

  private select!: Select;

  private scrollTop: number = 0;

  private scrollLeft: number = 0;

  private renderArea: { width: number, height: number } = { width: 0, height: 0 };

  private mouseMoving: boolean = false;

  constructor(el: HTMLElement, data: IGridData) {
    this.el = el;
    this.data = data;
    this.initEnv();
    this.render();
    this.registerListener();
  }

  initEnv() {
    this.selfBox = document.createElement('div');
    this.selfBox.style.cssText = 'position: relative; height: 100%; overflow: hidden;';
    this.el.appendChild(this.selfBox);

    const scrollSize = 10;
    const boxWidth = this.selfBox.offsetWidth;
    const boxHeight = this.selfBox.offsetHeight;
    const rowTotalSize = this.data.rows.reduce((size, value) => size + value, 0);
    const colTotalSize = this.data.cols.reduce((size, value) => size + value, 0);
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
    const canvasHeight = boxHeight - (hasYScrollBar ? scrollSize : 0);
    const canvasWidth = boxWidth - (hasXScrollBar ? scrollSize : 0);

    // create canvas
    this.canvasBox = document.createElement('div');
    this.canvasBox.style.cssText = `
      position: relative;
      float: left;
      box-sizing: border-box;
      border: 1px solid ${DefaultConfig.defaultBorder.color[0]};
      width: ${canvasWidth}px;
      height: ${canvasHeight}px;
      overflow: hidden;
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
      overflow: hidden;
    `;
    const scrollBlockStyle = `
      position: relative;
      border: 0px;
      background: #ffffff;
      cursor: pointer;
      border-radius: 3px;
    `;
    if (hasYScrollBar) {
      let YScrollMoving = false;
      let offset = { top: 0, left: 0 };
      let mouseOffsetY = 0;
      let max = canvasHeight;
      const YScroll = document.createElement('div');
      YScroll.style.cssText = `
        ${scrollStyle}
        float: right;
        width: ${scrollSize}px;
        height: ${canvasHeight}px;
      `;
      const YScrollBlock = document.createElement('div');
      const blockPer = canvasHeight / rowTotalSize;
      YScrollBlock.style.cssText = `
        ${scrollBlockStyle}
        width: ${scrollSize - 2}px;
        height: ${Math.floor(canvasHeight * blockPer)}px;
      `;
      YScrollBlock.addEventListener('mousedown', (event) => {
        YScrollMoving = true;
        mouseOffsetY = event.offsetY;
        event.stopPropagation();
        event.preventDefault();
      });
      document.body.addEventListener('mousemove', (event) => {
        if (YScrollMoving) {
          let top = event.y - offset.top - mouseOffsetY;
          if (top < 0) {
            top = 0;
          } else if (top > max) {
            top = max;
          }
          YScrollBlock.style.top = `${top}px`;
          this.scrollTop = top / blockPer;
          this.render();
          this.select.scrollRelocation(this.scrollLeft, this.scrollTop);
        }
      });
      document.body.addEventListener('mouseup', (event) => {
        YScrollMoving = false;
        mouseOffsetY = 0;
      });
      YScroll.appendChild(YScrollBlock);
      this.selfBox.appendChild(YScroll);
      offset = Util.getElAbsoluteOffset(YScroll);
      max -= YScrollBlock.offsetHeight;
    }

    // create X scroll
    if (hasXScrollBar) {
      let XScrollMoving = false;
      let offset = { top: 0, left: 0 };
      let mouseOffsetX = 0;
      let max = canvasWidth;
      const XScroll = document.createElement('div');
      XScroll.style.cssText = `
        ${scrollStyle}
        clear: both;
        width: ${canvasWidth}px;
        height: ${scrollSize}px;
      `;
      const XScrollBlock = document.createElement('div');
      const blockPer = canvasWidth / colTotalSize;
      XScrollBlock.style.cssText = `
        ${scrollBlockStyle}
        width: ${Math.floor(canvasWidth * blockPer)}px;
        height: ${scrollSize - 2}px;
      `;
      XScrollBlock.addEventListener('mousedown', (event) => {
        XScrollMoving = true;
        mouseOffsetX = event.offsetX;
        event.stopPropagation();
        event.preventDefault();
      });
      document.body.addEventListener('mousemove', (event) => {
        if (XScrollMoving) {
          let left = event.x - offset.left - mouseOffsetX;
          if (left < 0) {
            left = 0;
          } else if (left > max) {
            left = max;
          }
          XScrollBlock.style.left = `${left}px`;
          this.scrollLeft = left / blockPer;
          this.render();
          this.select.scrollRelocation(this.scrollLeft, this.scrollTop);
        }
      });
      document.body.addEventListener('mouseup', (event) => {
        XScrollMoving = false;
        mouseOffsetX = 0;
      });
      XScroll.appendChild(XScrollBlock);
      this.selfBox.appendChild(XScroll);
      offset = Util.getElAbsoluteOffset(XScroll);
      max -= XScrollBlock.offsetWidth;
    }

    this.renderArea.width = this.canvas.offsetWidth;
    this.renderArea.height = this.canvas.offsetHeight;

    this.select = new Select(this.canvasBox);
    this.editor = new Editor(this.canvasBox);
    Util.fitHighPixel(this.canvas);
  }

  render() {
    // render data
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      let x: number = -this.scrollLeft;
      let y: number = -this.scrollTop;
      let beginRow = 0;
      let beginCol = 0;
      while (x + this.data.cols[beginCol] < 0) {
        x += this.data.cols[beginCol];
        beginCol += 1;
      }
      while (y + this.data.rows[beginRow] < 0) {
        y += this.data.rows[beginRow];
        beginRow += 1;
      }
      let currentX = x;
      let currentY = y;
      for (let rowIndex = beginRow; rowIndex < this.data.rows.length; rowIndex += 1) {
        if (this.renderArea.height < currentY) {
          break;
        }
        const height = this.data.rows[rowIndex];
        for (let colIndex = beginCol; colIndex < this.data.cols.length; colIndex += 1) {
          if (this.renderArea.width < currentX) {
            break;
          }
          const cellConfig = this.data.cells[rowIndex][colIndex];
          const width = this.data.cols[colIndex];
          this.renderCell(ctx, currentX, currentY, width, height, cellConfig);
          currentX += width;
        }
        currentY += height;
        currentX = x;
      }
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

    BorderRender.render(ctx, x, y, width, height, config.border);
    TextRender.render(ctx, x, y, width, height, config.showText, config.font);

    ctx.restore();
  }

  getCellBound(offsetX: number, offsetY: number): ICellBound | undefined {
    const bound = {
      rowIndex: 0,
      colIndex: 0,
      x: 0,
      y: 0,
      height: 0,
      width: 0,
    };

    const absoluteX = offsetX + this.scrollLeft;
    const validX = this.data.cols.some((col, colIndex) => {
      if (bound.x <= absoluteX && bound.x + col >= absoluteX) {
        bound.width = col;
        bound.colIndex = colIndex;
        return true;
      }
      bound.x += col;
      return false;
    });
    bound.x -= this.scrollLeft;
    if (!validX) {
      return;
    }

    const absoluteY = offsetY + this.scrollTop;
    const validY = this.data.rows.some((row, rowIndex) => {
      if (bound.y <= absoluteY && bound.y + row >= absoluteY) {
        bound.height = row;
        bound.rowIndex = rowIndex;
        return true;
      }
      bound.y += row;
      return false;
    });
    bound.y -= this.scrollTop;
    if (!validY) {
      return;
    }

    return bound;
  }

  getCell(x: number, y: number) {
    return this.data.cells[y][x];
  }

  registerListener() {
    this.selfBox.addEventListener('mousedown', (event) => {
      if (event.target === this.canvas) {
        const { offsetX, offsetY } = event;
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
        const bound = this.getCellBound(offsetX, offsetY);
        if (bound) {
          this.select.move(
            bound,
            this.getCell(bound.colIndex, bound.rowIndex),
            this.scrollLeft,
            this.scrollTop,
          );
        }
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
      if (bound) {
        const cell = this.getCell(bound.colIndex, bound.rowIndex);
        this.editor.open(
          bound,
          cell.editText,
          cell.font?.name || DefaultConfig.defaultFont.name,
          cell.font?.size || DefaultConfig.defaultFont.size,
        );
      }
    }, true);
  }
}

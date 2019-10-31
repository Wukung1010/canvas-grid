import CellHelper from './src/cellHelper';
import DefaultStyle from './src/defaultStyle';

interface IGridData {
  options?: {
    showDefaultHead: boolean
  }
  rowCount: number
  colCount: number
  rows?: number|number[]
  cols?: number|number[]
  cells: (number|string)[][]
}

export default class Grid {
  public el: HTMLElement;
  public gridData: IGridData;
  public cellHelper?: CellHelper;

  constructor(el: HTMLElement, gridData: IGridData) {
    this.el = el;
    this.gridData = gridData;
    this.init();
  }

  init() {
    this.el.innerHTML = '';
    const canvas = this.createCanvas();
    this.el.append(canvas);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.cellHelper = new CellHelper(ctx);
      this.drawCells();
    }
  }

  drawCells() {
    if (!this.cellHelper) return;
    let x = 0, y = 0;
    let beginRow = 0; 
    let beginCol = 0;
    const endRow = this.gridData.rowCount;
    const endCol = this.gridData.colCount;
    const rowSizeMap = this.gridData.rows || DefaultStyle.row;
    const colSizeMap = this.gridData.cols || DefaultStyle.col;
    const cells = this.gridData.cells;

    for (let i = beginRow; i < endRow; i++) {
      const rowSize = Array.isArray(rowSizeMap) ? rowSizeMap[i] : rowSizeMap;
      for (let j = beginCol; j < endCol; j++) {
        const colSize = Array.isArray(colSizeMap) ? colSizeMap[i] : colSizeMap;
        this.cellHelper.drawCell({
          x, y, width: colSize, height: rowSize
        }, {
          text: cells[i][j]
        });
        x += colSize;
      }
      x = 0;
      y += rowSize;
    }
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

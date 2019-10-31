interface IRect {
  x: number
  y: number
  width: number
  height: number
}
interface ICellConfig {
  text: string|number
}

export default class Cell {
  private ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  drawCell(rect: IRect, cellConfig: ICellConfig) {
    this.clear(rect);
    this.drawBorder(rect, cellConfig);
    this.drawText(rect, cellConfig);
  }

  drawBorder(rect: IRect, cellConfig: ICellConfig) {
    const ctx = this.ctx;
    const {x, y, width, height} = rect;
    // calc endX; endY
    const endX = Math.ceil(x + width) - 0.5;
    const endY = Math.ceil(y + height) - 0.5;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(endX, y);
    ctx.lineWidth = 1;
    ctx.lineTo(endX, endY);
    ctx.lineTo(x, endY);
    ctx.stroke();
    ctx.restore();
  }

  drawText(rect: IRect, cellConfig: ICellConfig) {
    const ctx = this.ctx;
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cellConfig.text}`, rect.x, rect.y + rect.height / 2);
    ctx.restore();
  }

  clear(cellConfig: IRect) {
    const {x, y, width, height} = cellConfig;
    this.ctx.clearRect(x, y, width, height);
  }
}
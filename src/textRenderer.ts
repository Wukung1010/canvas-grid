// base
interface ITextConfig {
  x: number
  y: number
  width: number
  height: number
  text: string
}

// features
interface ITextConfig {
  color?: string
  size?: number
  family?: string
  horizontal?: number
  vertical?: number
  bold?: boolean
  italic?: boolean
  fold?: boolean
  fit?: boolean
}

export default class TextRenderer {
  private ctx: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(fontConfig: ITextConfig) {
    const ctx = this.ctx;
    const { x, y, width, height } = fontConfig;
    ctx.font = '80px 微软雅黑';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'start';
    ctx.fillStyle = '#000000';
    ctx.fillText(fontConfig.text, x, y + height/2, width);
    console.log(ctx.measureText(fontConfig.text));
  }
}
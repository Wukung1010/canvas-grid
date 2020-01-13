import DefaultConfig from '../defaultConfig';

enum BorderStyle {
  'single',
  'dotted',
}

export interface IBorderConfig {
  size?: number[],
  style?: BorderStyle[],
  color?: string[],
}

const defaultBorder = DefaultConfig.defaultBorder;
const lineDash = [4, 4];

const BorderRender = {
  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    border: IBorderConfig = defaultBorder
  ) {
    fitBorderStyle(
      ctx,
      border.size?.[0] ?? defaultBorder.size[0],
      border.style?.[0] ?? defaultBorder.style[0],
      border.color?.[0] ?? defaultBorder.color[0]
    );
    ctx.beginPath();
    const moveX = x + width - ctx.lineWidth / 2;
    ctx.moveTo(moveX, y);
    ctx.lineTo(moveX, y + height);
    ctx.stroke();
    
    fitBorderStyle(
      ctx,
      border.size?.[1] ?? defaultBorder.size[1],
      border.style?.[1] ?? defaultBorder.style[1],
      border.color?.[1] ?? defaultBorder.color[1]
    );
    ctx.beginPath();
    const moveY = y + height - ctx.lineWidth / 2;
    ctx.moveTo(x, moveY);
    ctx.lineTo(x + width, moveY);
    ctx.stroke();
  },
};

function fitBorderStyle(ctx: CanvasRenderingContext2D, size: number, style: BorderStyle, color: string) {
  ctx.lineWidth = size;
  if (style === BorderStyle.dotted) {
    ctx.setLineDash(lineDash);
  } else {
    ctx.setLineDash([]);
  }
  ctx.strokeStyle = color;
}

export default BorderRender;
import { ICellFont } from "../Grid";
import DefaultConfig from '../defaultConfig';

const defaultFont = DefaultConfig.defaultFont;

export enum FontVertical {
  'top',
  'middle',
  'bottom',
}
export enum FontHorizontal {
  'left',
  'middle',
  'right',
}

const TextRender = {
  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    font: ICellFont = defaultFont
  ) {
    let renderX = x;
    let renderY = y;
    const name = font.name ?? defaultFont.name;
    const size = font.size ?? defaultFont.size;
    const bold = font.isBold ?? defaultFont.isBold;
    const italic = font.isItalic ?? defaultFont.isItalic;
    const color = font.color ?? defaultFont.color;
    const hori = font.horizontal ?? defaultFont.horizontal;
    const vert = font.vertical ?? defaultFont.vertical;
    ctx.font = `${italic ? 'italic' : ''} ${bold ? 'bold' : ''} ${size}px ${name}`;
    ctx.fillStyle = color;
    if (vert === FontVertical.top) {
      ctx.textBaseline = 'top';
    } else if (vert === FontVertical.bottom) {
      ctx.textBaseline = 'bottom';
      renderY = y + height;
    } else {
      // middle
      ctx.textBaseline = 'middle';
      renderY = y + Math.ceil(height / 2);
    }
    if (hori === FontHorizontal.middle) {
      ctx.textAlign = 'center';
      renderX = x + Math.ceil(width / 2);
    } else if (hori === FontHorizontal.right) {
      ctx.textAlign = 'right';
      renderX = x + width;
    } else {
      ctx.textAlign = 'left';
    }
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.fillText(text, renderX, renderY, width);
  }
}

export default TextRender;

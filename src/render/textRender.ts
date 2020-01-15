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

interface IRenderConfig {
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  size: number,
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
    const fitSize = font.isFitSize ?? defaultFont.isFitSize;
    const wrapLine = font.isWrapLine ?? defaultFont.isWrapLine;

    const renderConfig: IRenderConfig[] = [];

    if (wrapLine || fitSize) {
      const box = getSpanBox ();
      const span = box.children[0] as HTMLElement;
      span.style.font = `${size}px ${name}`;
      span.innerText = text;
      if (fitSize) {
      }
      if (wrapLine) {

      }
    } else {
      renderConfig.push({
        x, y, width, height, text, size,
      });
    }

    ctx.rect(x, y, width, height);
    ctx.clip();

    renderConfig.forEach((config) => {
      ctx.font = `${italic ? 'italic' : ''} ${bold ? 'bold' : ''} ${config.size}px ${name}`;
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
      ctx.fillText(text, renderX, renderY);
    });
  },
};

function getSpanBox () {
  let box = document.getElementById('__text_render_span_box__');
  if (!box) {
    box = document.createElement('div');
    box.style.cssText = `position: absolute; left = -1000px`;
    const p = document.createElement('p');
    box.appendChild(p);
    document.body.appendChild(box);
  }
  return box;
}

export default TextRender;

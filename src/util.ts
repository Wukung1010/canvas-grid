/* eslint no-param-reassign: "off",no-unused-expressions: "off" */
function fitHighPixel(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio ?? 1;
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;
  canvas.width = Math.round(oldWidth * dpr);
  canvas.height = Math.round(oldHeight * dpr);
  canvas.style.width = `${oldWidth}px`;
  canvas.style.height = `${oldHeight}px`;
  ctx?.scale?.(dpr, dpr);
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
  while (target && target !== document.body) {
    if (target.style.position === 'relative' || target.style.position === 'absolute') {
      offset.top += target.offsetTop;
      offset.left += target.offsetLeft;
    }
    target = target.parentElement;
  }
  return offset;
}

export default {
  fitHighPixel,
  getTextSize,
  getElAbsoluteOffset,
};

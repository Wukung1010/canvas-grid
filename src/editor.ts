import { ICellBound } from './Grid';

enum EditStatus {
  'close',
  'editing'
}

export default class Editor {
  private el?: HTMLElement;

  private editor?: HTMLInputElement;

  private status: EditStatus = 0;

  private boundCache?: ICellBound;

  constructor(el: HTMLElement) {
    this.el = el;
    this.createEditor();
  }

  createEditor() {
    this.editor = document.createElement('input');
    this.editor.style.cssText = 'position: absolute; display: none; box-sizing: border-box;';
    (this.el as HTMLElement).appendChild(this.editor);
  }

  open(bound: ICellBound, text: string, name: string, size: number) {
    if (this.editor) {
      this.status = EditStatus.editing;
      this.boundCache = bound;
      this.editor.value = text;
      this.editor.style.display = 'block';
      this.editor.style.top = `${bound.y}px`;
      this.editor.style.left = `${bound.x}px`;
      this.editor.style.width = `${bound.width - 1}px`;
      this.editor.style.height = `${bound.height - 1}px`;
      this.editor.style.fontFamily = name;
      this.editor.style.fontSize = `${size}px`;
    }
  }

  close() {
    if (this.editor) {
      this.status = EditStatus.close;
      this.boundCache = undefined;
      this.editor.style.display = 'none';
      return this.editor.value;
    }
  }

  getEditorBound(): ICellBound|undefined {
    return this.boundCache;
  }

  isEditing() {
    return this.status === EditStatus.editing;
  }

  destroy() {
    if (this.el && this.editor) {
      this.el.removeChild(this.editor);
      this.el = undefined;
    }
  }
}

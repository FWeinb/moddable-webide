import { IRange } from 'monaco-editor/esm/vs/editor/editor.api';

export type BreakPoint = {
  fileId: string;
  message: string;
  line: number;
};

export type EditorFile = {
  id: string;
  dirty: boolean;
};

export type Editor = {
  activeFile: EditorFile;
  openTabs: EditorFile[];

  activeBreakPoint: BreakPoint;
  openSelection: any;
};

const state: Editor = {
  activeFile: undefined,
  openTabs: [],
  activeBreakPoint: undefined,
  openSelection: undefined
};

export default state;

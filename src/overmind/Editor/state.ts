export type EditorBreakpoint = {
  fileId: string;
  line: number;
  message?: string;
  active?: boolean;
};

export type EditorFile = {
  id: string;
  dirty: boolean;
};

export type Editor = {
  activeFile: EditorFile;
  openTabs: EditorFile[];
  breakpoints: EditorBreakpoint[];
  openSelection: any;
};

const state: Editor = {
  activeFile: undefined,
  openTabs: [],
  breakpoints: [],
  openSelection: undefined
};

export default state;

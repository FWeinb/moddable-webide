export type EditorBreakpoint = {
  fileId: string;
  line: number;
  disabled?: boolean;
};

export type EditorFile = {
  id: string;
  dirty: boolean;
};

export type Editor = {
  activeFile: EditorFile;
  openTabs: EditorFile[];
  breakpoints: EditorBreakpoint[];
  currentBreakpoint: EditorBreakpoint & { message: string };
};

const state: Editor = {
  activeFile: null,
  openTabs: [],
  breakpoints: [],
  currentBreakpoint: null
};

export default state;

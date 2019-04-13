import monaco from '../../components/Editor/monaco';

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
};

const state: Editor = {
  activeFile: undefined,
  openTabs: [],
  activeBreakPoint: undefined
};

export default state;

import { File, FileMap } from '../rootState';

export type BreakPoint = {
  path: string;
  message: string;
  line: number;
};

export type Editor = {
  activeFile: File;

  openFile: string;
  openTabs: string[];

  files: FileMap;
  activeBreakPoint: BreakPoint;
};

const state: Editor = {
  get activeFile() {
    return this.files && this.files[this.openFile];
  },
  openFile: undefined,
  openTabs: [],
  files: {},
  activeBreakPoint: undefined
};

export default state;

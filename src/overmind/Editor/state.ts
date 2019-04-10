import { File, FileMap } from '../rootState';
import monaco from '../../components/Editor/monaco';

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

  models: {
    [key: string]: monaco.editor.ITextModel;
  };
};

const state: Editor = {
  get activeFile() {
    return this.files && this.files[this.openFile];
  },
  openFile: undefined,
  openTabs: [],
  files: {},
  activeBreakPoint: undefined,

  models: {}
};

export default state;

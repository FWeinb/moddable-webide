import { Derive } from 'overmind';

export type File = {
  name: string;
  content: string;
  dirty: boolean;
  open: boolean;
};

export type FileMap = {
  [path: string]: File;
};

export type Editor = {
  currentFileName: string;
  currentFile: File;
  openFiles: File[];
  files: FileMap;
};

export type Message = {
  type: string;
  time: number;
  text: string;
};

export type Device = {
  host: string;
};

export type Log = {
  messages: Message[];
};

export enum CompilerState {
  LOADING,
  READY,
  BUSY
}

export type Compiler = {
  state: CompilerState;
  compilation: Uint8Array;
  errors?: string[];
};

export type State = {
  device: Device;
  editor: Editor;
  compiler: Compiler;
  log: Log;
};

export const state: State = {
  device: {
    host: 'runmod.local'
  },
  editor: {
    currentFileName: undefined,
    get currentFile() {
      return this.currentFileName && this.files[this.currentFileName];
    },
    // This state shape isn't optimal
    // needs to be redone
    openFiles: [],
    files: {}
  },
  log: {
    messages: []
  },
  compiler: {
    state: CompilerState.LOADING,
    compilation: null,
    errors: null
  }
};

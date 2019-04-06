import XsbugConnection from '../xs/XsbugConnection';

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

export type DeviceInstrument = {
  name: string;
  value: string;
};

export enum DeviceInstrumentConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR
}

export type Device = {
  host: string;
  debugConnectionState: DeviceInstrumentConnectionState;
  instruments: Array<DeviceInstrument>;
  stats: Array<number>;
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

export enum SidebarView {
  FileExplorer,
  Debug
}

export type IDE = {
  selectedSidebarView: SidebarView;
};

export type State = {
  ide: IDE;
  device: Device;
  editor: Editor;
  compiler: Compiler;
  log: Log;
};

export const state: State = {
  ide: {
    selectedSidebarView: SidebarView.FileExplorer
  },
  device: {
    host: 'runmod.local',
    debugConnectionState: DeviceInstrumentConnectionState.DISCONNECTED,
    instruments: null,
    stats: null
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

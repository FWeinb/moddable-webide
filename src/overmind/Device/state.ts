import {
  DeviceConnection,
  DeviceDebugger,
  XsbugLocalMessage,
  XsbugGlobalMessage,
  XsbugGrammerMessage,
  XsbugFrame,
  DeviceControl
} from '../../xs/DeviceConnection';

export type DeviceInstrument = {
  name: string;
  value: string[];
  indices: string[];
};

export enum ConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR
}

export enum DebugState {
  CONNECTED,
  CONNECTING,
  DISCONNECTED
}

export type DebugBreak = {
  fileId?: number;
  path: string;
  line: number;
  message: string;
};

export type Debug = {
  state: DebugState;
  debugger: DeviceDebugger;
  activeBreak: DebugBreak;
  instruments: DeviceInstrument[];
  samples: number[][];
  frames: {
    calls: XsbugFrame[];
    local: XsbugLocalMessage;
    global: XsbugGlobalMessage;
    grammer: XsbugGrammerMessage;
  };
};

export type Device = {
  host: string;
  connectionState: ConnectionState;
  connection: DeviceConnection;
  control: DeviceControl;
  debug: Debug;
};

const state: Device = {
  host: 'runmod.local',

  connectionState: ConnectionState.DISCONNECTED,
  connection: null,
  control: null,

  debug: {
    state: DebugState.DISCONNECTED,
    debugger: null,

    activeBreak: null,
    frames: {
      calls: null,
      local: null,
      global: null,
      grammer: null
    },
    instruments: null,
    samples: null
  }
};

export default state;

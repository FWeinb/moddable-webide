import {
  DeviceConnection,
  XsbugLocalMessage,
  XsbugGlobalMessage,
  XsbugGrammerMessage,
  XsbugFrame
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
  debug: Debug;
};

const state: Device = {
  host: 'runmod.local',
  connectionState: ConnectionState.DISCONNECTED,
  debug: {
    state: DebugState.DISCONNECTED,
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

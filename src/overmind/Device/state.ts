import {
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

export enum ConnectionType {
  USB = 'USB',
  WIFI = 'WIFI'
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export enum DebugState {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED'
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
  baudRate: number;
  connectionType: ConnectionType;
  connectionState: ConnectionState;
  debug: Debug;
};

const state: Device = {
  host: 'runmod.local',
  baudRate: 921600,
  connectionType: ConnectionType.USB,
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

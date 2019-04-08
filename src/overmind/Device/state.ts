import XsbugConnection from '../../xs/XsbugConnection';

export type DeviceInstrument = {
  name: string;
  value: string;
};

export enum DebugState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR
}

export type DebugConnection = {
  state: DebugState;
  connection: XsbugConnection;
  instruments: Array<DeviceInstrument>;
  samples: Array<number>;
};

export type Device = {
  host: string;
  debug: DebugConnection;
};

const state: Device = {
  host: 'runmod.local',
  debug: {
    state: DebugState.DISCONNECTED,
    connection: null,
    instruments: null,
    samples: null
  }
};

export default state;

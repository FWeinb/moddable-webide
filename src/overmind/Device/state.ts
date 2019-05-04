import DeviceConnection from '../../xs/DeviceConnection';

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

export type Debug = {
  state: DebugState;
  instruments: DeviceInstrument[];
  samples: number[][];
};

export type Device = {
  host: string;
  connectionState: ConnectionState;
  connection: DeviceConnection;
  debug: Debug;
};

const state: Device = {
  host: 'runmod.local',
  connectionState: ConnectionState.DISCONNECTED,
  connection: null,
  debug: {
    state: DebugState.DISCONNECTED,
    instruments: null,
    samples: null
  }
};

export default state;

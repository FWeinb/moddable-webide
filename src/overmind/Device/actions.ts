import { pipe, mutate, wait, Action, run } from 'overmind';

import * as o from './operators';

export const setDeviceHostName: Action<string> = ({ state }, hostName) => {
  state.Device.host = hostName;
};

export const connectDebugger: Action = pipe(
  o.createConnection,
  o.addDebugger,
  o.ensureConnected
);

export const installMod: Action<Uint8Array> = pipe(
  o.ensureConnection,
  mutate(({ state, actions }, payload: Uint8Array) => {
    state.Device.connection.doSetPreference('config', 'when', 'debug');
    actions.Log.addMessage('Uploading...');
    state.Device.connection.doInstall(0, payload);
    actions.Log.addMessage('...done');
    state.Device.connection.doRestart();
    state.Device.connection.disconnect();
  }),
  wait(100),
  o.createConnection,
  o.addDebugger,
  // TODO:
  // The device should not accept new connection when doRestart()
  // was called.
  wait(2000),
  o.ensureConnected
);

// Debugging
export const debugContinue: Action = async ({ state }) => {
  state.Editor.activeBreakPoint = undefined;
  state.Device.connection.doGo();
};

export const debugBreak: Action = ({ state }) => {
  state.Device.connection.doStep();
};

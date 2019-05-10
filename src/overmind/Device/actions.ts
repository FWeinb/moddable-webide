import {
  pipe,
  mutate,
  wait,
  when,
  run,
  Action,
  Operator,
  noop
} from 'overmind';

import * as o from './operators';
import { SidebarView } from '../rootState';

export const setDeviceHostName: Action<string> = ({ state }, hostName) => {
  state.Device.host = hostName;
};

export const connectDebugger: Action = pipe(
  o.checkConnection,
  run(({ state, actions }) => {
    if (state.selectedSidebarView !== SidebarView.Debug) {
      actions.setActiveSidebarView(SidebarView.Debug);
    }
  })
);

const connectAfterRestart = pipe(
  wait(100),
  o.setupConnection,
  // TODO:
  // The device should not accept new connection when doRestart()
  // was called.
  wait(2000),
  o.connect
);

export const installMod: Action<Uint8Array> = pipe(
  o.checkConnection,
  mutate(({ state, actions }, payload: Uint8Array) => {
    console.log(state.Device.control);
    state.Device.control.doSetPreference('config', 'when', 'debug');
    actions.Log.addMessage('Uploading...');
    state.Device.control.doInstall(0, payload);
    actions.Log.addMessage('...done');
    state.Device.control.doRestart();
  }),
  connectAfterRestart
);

// Debugging
export const debugRestart: Action = pipe(
  mutate(async ({ state }) => {
    state.Editor.activeBreakPoint = null;
    state.Device.debug.activeBreak = null;
    state.Device.control.doRestart();
  }),
  connectAfterRestart
);

export const debugGo: Action = async ({ state }) => {
  state.Editor.activeBreakPoint = null;
  state.Device.debug.activeBreak = null;
  state.Device.debug.debugger.doGo();
};

export const debugStep: Action = ({ state }) => {
  state.Device.debug.debugger.doStep();
};

export const debugSelectFrame: Action<string> = ({ state }, value) => {
  state.Device.debug.debugger.doSelect(value);
};

export const debugToggleValue: Action<string> = ({ state }, value) => {
  state.Device.debug.debugger.doToggle(value);
};

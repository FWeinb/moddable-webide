import { pipe, mutate, map, run, Action, fork } from 'overmind';
import * as o from './operators';

import { XsbugMessageType, XsbugMessage } from '../../xs/DeviceConnection';
import { EditorBreakpoint } from '../Editor/state';
import { getPath, getDevicePath } from '../Storage/utils';
import state from './state';

export const setDeviceHostName: Action<string> = ({ state }, hostName) => {
  state.Device.host = hostName;
};

export const connectDebugger: Action = o.ensureConnection;

export const handleConnectionEvents: Action<XsbugMessage<any>> = pipe(
  o.forkConnectionEvent({
    [XsbugMessageType.Login]: o.debugLogin,
    [XsbugMessageType.Frames]: o.debugFrames,
    [XsbugMessageType.Local]: o.debugLocal,
    [XsbugMessageType.Global]: o.debugGlobal,
    [XsbugMessageType.Grammer]: o.debugGrammer,
    [XsbugMessageType.Break]: o.debugBreak,
    [XsbugMessageType.Log]: o.debugLog,
    [XsbugMessageType.InstrumentSample]: o.debugInstrumentSample,
    [XsbugMessageType.Instrument]: o.debugInstrument
  })
);

export const installMod: Action<Uint8Array> = pipe(
  o.ensureConnection,
  mutate(({ actions, effects }, payload: Uint8Array) => {
    effects.Device.connection.doSetPreference('config', 'when', 'debug');
    actions.Log.addMessage('Uploading...');
    effects.Device.connection.doInstall(0, payload);
    actions.Log.addMessage('...done');
    effects.Device.connection.doRestart();
  }),
  o.disconnect,
  o.connectAfterRestart
);

export const debugRestart: Action = pipe(
  mutate(async ({ state, effects }) => {
    state.Editor.activeBreakPoint = null;
    state.Device.debug.activeBreak = null;
    effects.Device.connection.doRestart();
  }),
  o.disconnect,
  o.connectAfterRestart
);

export const clearBreakpoint: Action<EditorBreakpoint> = (
  { state, effects },
  breakpoint
) => {
  effects.Device.connection &&
    effects.Device.connection.doClearBreakpoint(
      getDevicePath(state.Storage, breakpoint.fileId),
      breakpoint.line
    );
};
export const addBreakpoint: Action<EditorBreakpoint> = (
  { state, effects },
  breakpoint
) => {
  effects.Device.connection &&
    effects.Device.connection.doSetBreakpoint(
      getDevicePath(state.Storage, breakpoint.fileId),
      breakpoint.line
    );
};

export const debugGo: Action = ({ state, effects }) => {
  state.Editor.activeBreakPoint = null;
  state.Device.debug.activeBreak = null;
  effects.Device.connection.doGo();
};

export const debugStep: Action = ({ effects }) => {
  effects.Device.connection.doStep();
};
export const debugStepInside: Action = ({ effects }) => {
  effects.Device.connection.doStepInside();
};
export const debugStepOutside: Action = ({ effects }) => {
  effects.Device.connection.doStepOutside();
};

export const debugSelectFrame: Action<string> = ({ effects }, value) => {
  effects.Device.connection.doSelect(value);
};

export const debugToggleValue: Action<string> = ({ effects }, value) => {
  effects.Device.connection.doToggle(value);
};

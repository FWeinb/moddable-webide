import {
  pipe,
  mutate,
  run,
  when,
  Action,
  Operator,
  noop,
  action,
  wait
} from 'overmind';
import * as o from './operators';

import {
  XsbugMessageType,
  ConnectionEvent,
  DeviceConnectionEventTypes
} from '../../xs/DeviceConnection';
import { EditorBreakpoint } from '../Editor/state';
import { getDevicePath } from '../Storage/utils';
import { ConnectionType, ConnectionState, DebugState, Debug } from './state';

export const setConnectionType: Action<ConnectionType> = pipe(
  mutate(({ state }, connectionType) => {
    state.Device.connectionType = connectionType;
  }),
  when(
    ({ state }) =>
      state.Device.connectionState !== ConnectionState.DISCONNECTED,
    {
      true: o.disconnect,
      false: noop()
    }
  )
);

export const setBaudRate: Action<number> = ({ state }, baudRate) => {
  state.Device.baudRate = baudRate;
};

export const setHostName: Action<string> = ({ state }, hostName) => {
  state.Device.host = hostName;
};

export const connectDebugger: Action = pipe(
  o.ensureConnection,
  o.connectWithDebugger
);

export const handleConnectionEvents: Operator<
  ConnectionEvent<any, any>
> = o.forkConnectionEvent({
  [XsbugMessageType.Login]: o.debugLogin,
  [XsbugMessageType.Frames]: o.debugFrames,
  [XsbugMessageType.Local]: o.debugLocal,
  [XsbugMessageType.Global]: o.debugGlobal,
  [XsbugMessageType.Grammer]: o.debugGrammer,
  [XsbugMessageType.Break]: o.debugBreak,
  [XsbugMessageType.Log]: o.debugLog,
  [XsbugMessageType.InstrumentSample]: o.debugInstrumentSample,
  [XsbugMessageType.Instrument]: o.debugInstrument,
  [DeviceConnectionEventTypes.ConnectionError]: o.connectionError
});

export const installMod: Action<Uint8Array> = pipe(
  o.ensureConnection,
  o.connectWithoutDebugger,
  mutate(async ({ actions, effects, state }, payload: Uint8Array) => {
    const configWhen =
      state.Device.connectionType === ConnectionType.USB ? 'boot' : 'debug';

    effects.Device.connection.doSetPreference('config', 'when', configWhen);
    actions.Log.addMessage('Uploading...');

    effects.Device.connection.doStep();
    await effects.Device.connection.once(XsbugMessageType.Break);

    await effects.Device.connection.doInstall(payload);

    actions.Log.addMessage('...done');
    effects.Device.connection.doRestart();
  }),
  o.disconnect,
  o.connectAfterRestart,
  o.connectWithDebugger,
  o.catchConnectionError
);

export const debugRestart: Action = pipe(
  mutate(async ({ state, effects }) => {
    state.Editor.currentBreakpoint = null;
    state.Device.debug.activeBreak = null;
    effects.Device.connection.doRestart();
  }),
  o.disconnect,
  o.connectAfterRestart,
  o.connectWithDebugger
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
  state.Editor.currentBreakpoint = null;
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

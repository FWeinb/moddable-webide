import {
  wait,
  run,
  mutate,
  Operator,
  pipe,
  when,
  fork,
  forEach,
  noop,
  map,
  catchError
} from 'overmind';
import { ConnectionState, DebugState, ConnectionType } from './state';
import { cleanInstrumentData } from './utils';
import { SidebarView } from '../rootState';
import { getIdByPath, getPath, getDevicePath } from '../Storage/utils';
import {
  XsbugMessage,
  XsbugLocalMessage,
  XsbugLoginMessage,
  XsbugInstrumentMessage,
  XsbugInstrumentSampleMessage,
  XsbugFramesMessage,
  XsbugGlobalMessage,
  XsbugBreakMessage,
  XsbugGrammerMessage,
  XsbugLogMessage,
  ConnectionEvent,
  ConnectionErrorMessage
} from '../../xs/DeviceConnection';
import { CompilerState } from '../Compiler/state';

export const syncBreakpoints: Operator = run(({ state, effects }) => {
  effects.Device.connection &&
    effects.Device.connection.doSetAllBreakpoints(
      state.Editor.breakpoints
        .filter(breakpoint => !breakpoint.disabled)
        .map(breakpoint => ({
          path: getDevicePath(state.Storage, breakpoint.fileId),
          line: breakpoint.line
        }))
    );
});

export const forkConnectionEvent: (paths: {
  [key: string]: Operator<ConnectionEvent<any, any>, any>;
}) => Operator<ConnectionEvent<any, any>> = paths =>
  fork((_, value) => value.type, paths) as Operator<ConnectionEvent<any, any>>;

export const setActiveSidebarToDebug: Operator = run(({ state, actions }) => {
  if (state.selectedSidebarView !== SidebarView.Debug) {
    actions.setActiveSidebarView(SidebarView.Debug);
  }
});

export const setConnectionState = (newState: ConnectionState) =>
  mutate(({ state }) => {
    state.Device.connectionState = newState;
  });

export const setDebugState = (newState: DebugState) =>
  mutate(({ state }) => {
    state.Device.debug.state = newState;
  });

export const ensureConnection: Operator<any> = when(
  ({ effects }) => effects.Device.connection === null,
  {
    // Disconnected
    true: pipe(
      setConnectionState(ConnectionState.CONNECTING),
      mutate(({ state, effects }) => {
        switch (state.Device.connectionType) {
          case ConnectionType.WIFI:
            effects.Device.createWifiConnection(
              `ws://${state.Device.host}:8080`
            );
            break;
          case ConnectionType.USB:
            effects.Device.createUsbConnection(state.Device.baudRate);
            break;
        }
      })
    ),
    // Connected
    false: noop()
  }
);
export const connectWithoutDebugger: Operator<any> = mutate(
  async ({ state, effects }) => {
    effects.Device.removeAllDebugListener();
    await effects.Device.connection.connect();
    state.Device.connectionState = ConnectionState.CONNECTED;
  }
);

export const connectWithDebugger: Operator<any> = pipe(
  setDebugState(DebugState.CONNECTING),
  mutate(async ({ effects, actions }) => {
    effects.Device.addDebugListener((_, event) => {
      actions.Device.handleConnectionEvents(event);
    });
    await effects.Device.connection.connect();
  }),
  setConnectionState(ConnectionState.CONNECTED),
  syncBreakpoints,
  setActiveSidebarToDebug
);

export const catchConnectionError: Operator = catchError(
  ({ state, actions }, e: any) => {
    state.Device.connectionState = ConnectionState.ERROR;
    state.Device.debug.state = DebugState.DISCONNECTED;
    if (state.Compiler.state === CompilerState.BUSY) {
      state.Compiler.state = CompilerState.READY;
    }
    actions.Log.addErrorMessage(e.toString());
    if (e.NETWORK_ERR === e.code) {
      actions.Log.addErrorMessage(
        ' ** Looks like you need to uninstall the driver **'
      );
    }
    if (navigator.usb === undefined) {
      actions.Log.addErrorMessage(
        ' ** Looks like WebUSB is not supported, or you are on an unsafe connection **'
      );
    }
  }
);

export const connectAfterRestart: Operator = pipe(
  wait(2000),
  ensureConnection
);

export const disconnect: Operator = mutate(async ({ state, effects }) => {
  state.Device.debug.state = DebugState.DISCONNECTED;
  state.Device.connectionState = ConnectionState.DISCONNECTED;
  effects.Device.connection.clearListeners();
  await effects.Device.closeConnection();
});

// Debug events:
export const debugLogin: Operator<XsbugLoginMessage> = mutate(
  ({ state, actions, effects }) => {
    state.Device.debug.state = DebugState.CONNECTED;
    actions.Log.addMessage('Debugger connected');
    effects.Device.connection.doGo();
  }
);

export const debugInstrument: Operator<XsbugInstrumentMessage> = mutate(
  ({ state }, msg) => {
    state.Device.debug.instruments = cleanInstrumentData(msg.value.instruments);
  }
);
export const debugInstrumentSample: Operator<
  XsbugInstrumentSampleMessage
> = mutate(({ state }, msg) => {
  if (!state.Device.debug.samples) {
    state.Device.debug.samples = msg.value.samples.map(sample => [sample]);
  } else {
    msg.value.samples.forEach((sample, index) => {
      state.Device.debug.samples[index].push(sample);
      state.Device.debug.samples[index].splice(
        0,
        state.Device.debug.samples[index].length - 100
      );
    });
  }
});

export const debugFrames: Operator<XsbugFramesMessage> = mutate(
  ({ state }, msg) => {
    state.Device.debug.frames.calls = msg.value.frames;
  }
);
export const debugLocal: Operator<XsbugLocalMessage> = mutate(
  ({ state }, msg) => {
    state.Device.debug.frames.local = msg;
  }
);

export const debugGlobal: Operator<XsbugGlobalMessage> = mutate(
  ({ state }, msg) => {
    state.Device.debug.frames.global = msg;
  }
);
export const debugGrammer: Operator<XsbugGrammerMessage> = mutate(
  ({ state }, msg) => {
    state.Device.debug.frames.grammer = msg;
  }
);

export const debugBreak: Operator<XsbugBreakMessage> = mutate(
  ({ state, actions }, msg) => {
    let { path, line, message } = msg.value;

    // HINT: The path will have the `/mc` prefix
    // because this is where it is compiled
    // remove it here `/mc`
    if (path && path.startsWith('/mc')) {
      path = path.substr(3);
    }

    actions.Log.addErrorMessage(`Break ${path}:${line}: ${message}`);

    const fileId = getIdByPath(state.Storage, path.substring(1));
    if (fileId) {
      state.Editor.currentBreakpoint = {
        fileId,
        line,
        message
      };
      actions.Editor.openFile(fileId);
    }

    state.Device.debug.activeBreak = {
      path,
      fileId,
      line,
      message
    };

    if (state.selectedSidebarView !== SidebarView.Debug) {
      actions.setActiveSidebarView(SidebarView.Debug);
    }
  }
);
export const debugLog: Operator<XsbugLogMessage> = mutate(
  ({ actions }, msg) => {
    // TODO: Fix this in overmind
    actions.Log.addMessage(msg.value.log);
  }
);

export const connectionError: Operator<ConnectionErrorMessage> = pipe(
  mutate(({ actions }, msg) => {
    // TODO: Fix this in overmind
    actions.Log.addErrorMessage(msg.value.message);
  }),
  disconnect
);

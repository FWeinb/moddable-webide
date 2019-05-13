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
  map
} from 'overmind';
import { ConnectionState, DebugState } from './state';
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
  XsbugLogMessage
} from '../../xs/DeviceConnection';
import { EditorBreakpoint } from '../Editor/state';

export const syncBreakpoints: Operator<EditorBreakpoint[]> = run(
  ({ state, effects }, breakpoints) => {
    effects.Device.connection &&
      effects.Device.connection.doSetAllBreakpoints(
        breakpoints.map(breakpoint => ({
          path: getDevicePath(state.Storage, breakpoint.fileId),
          line: breakpoint.line
        }))
      );
  }
);

export const forkConnectionEvent: (paths: {
  [key: string]: Operator<XsbugMessage<any>, any>;
}) => Operator<XsbugMessage<any>> = paths =>
  fork((_, value) => value.type, paths) as Operator<XsbugMessage<any>>;

export const setActiveSidebarToDebug: Operator = run(({ state, actions }) => {
  if (state.selectedSidebarView !== SidebarView.Debug) {
    actions.setActiveSidebarView(SidebarView.Debug);
  }
});

export const ensureConnection: Operator<any> = pipe(
  when(({ effects }) => effects.Device.connection !== null, {
    // Connected
    true: noop(),
    // Disconnected
    false: pipe(
      mutate(async ({ state, effects, actions }) => {
        state.Device.debug.state = DebugState.CONNECTING;
        state.Device.connectionState = ConnectionState.CONNECTING;
        const connection = effects.Device.createConnection(
          `ws://${state.Device.host}:8080`
        );
        connection.onAny((_, event) => {
          actions.Device.handleConnectionEvents(event);
        });
        try {
          await effects.Device.connection.connect();
          state.Device.connectionState = ConnectionState.CONNECTED;
        } catch (e) {
          state.Device.connectionState = ConnectionState.ERROR;
          actions.Log.addErrorMessage(e.toString());
          throw e;
        }
      }),
      map(({ state }) => state.Editor.breakpoints),
      syncBreakpoints,
      setActiveSidebarToDebug
    )
  })
);

export const connectAfterRestart: Operator = pipe(
  wait(2000),
  ensureConnection
);

export const disconnect: Operator = mutate(({ state, effects }) => {
  state.Device.debug.state = DebugState.DISCONNECTED;
  state.Device.connectionState = ConnectionState.DISCONNECTED;
  effects.Device.closeConnection();
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
    console.log(msg);
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
      actions.Editor.addBreakpoint({
        fileId,
        line,
        message,
        active: true
      });
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
export const debugLog: Operator<XsbugLogMessage> = run(({ actions }, msg) => {
  actions.Log.addMessage(msg.value.log);
});

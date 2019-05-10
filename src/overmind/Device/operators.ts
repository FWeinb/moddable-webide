import { wait, run, mutate, Operator, pipe, when, noop } from 'overmind';
import { ConnectionState, DebugState } from './state';
import { cleanInstrumentData } from './utils';
import { SidebarView } from '../rootState';
import { getIdByPath } from '../Storage/utils';
import {
  DeviceDebugger,
  XsbugMessageType,
  DeviceControl,
  DeviceConnection
} from '../../xs/DeviceConnection';

export const disconnectIfConnected: Operator = pipe(
  mutate(({ state }) => {
    if (state.Device.connection !== null) {
      state.Device.connectionState = ConnectionState.DISCONNECTED;
      state.Device.connection.close();
      state.Device.connection = null;
    }
  })
);

export const createConnection: Operator = mutate(({ state, effects }) => {
  state.Device.debug.state = DebugState.DISCONNECTED;
  state.Device.connectionState = ConnectionState.CONNECTING;
  state.Device.connection = new DeviceConnection(
    `ws://${state.Device.host}:8080`
  );
});

export const connect: Operator = mutate(async ({ state }) => {
  try {
    await state.Device.connection.connect();
    state.Device.connectionState = ConnectionState.CONNECTED;
  } catch (e) {
    state.Device.connectionState = ConnectionState.ERROR;
    throw e;
  }
});

export const createDebugger: Operator = mutate(({ state, actions }) => {
  const deviceDebugger = new DeviceDebugger(state.Device.connection);

  deviceDebugger.on(XsbugMessageType.Login, msg => {
    state.Device.debug.state = DebugState.CONNECTED;
    actions.Log.addMessage('Debugger connected');
    deviceDebugger.doGo();
  });

  deviceDebugger.on(XsbugMessageType.Instrument, msg => {
    state.Device.debug.instruments = cleanInstrumentData(msg.instruments);
  });
  deviceDebugger.on(XsbugMessageType.InstrumentSample, msg => {
    if (!state.Device.debug.samples) {
      state.Device.debug.samples = msg.samples.map(sample => [sample]);
    } else {
      msg.samples.forEach((sample, index) => {
        state.Device.debug.samples[index].push(sample);
        state.Device.debug.samples[index].splice(
          0,
          state.Device.debug.samples[index].length - 100
        );
      });
    }
  });
  deviceDebugger.on(XsbugMessageType.Frames, msg => {
    state.Device.debug.frames.calls = msg.frames;
  });
  deviceDebugger.on(XsbugMessageType.Local, msg => {
    state.Device.debug.frames.local = msg;
  });
  deviceDebugger.on(XsbugMessageType.Global, msg => {
    state.Device.debug.frames.global = msg;
  });
  deviceDebugger.on(XsbugMessageType.Grammer, msg => {
    state.Device.debug.frames.grammer = msg;
  });
  deviceDebugger.on(XsbugMessageType.Break, msg => {
    let { path, line, message } = msg;

    // HINT: The path will have the `/mc` prefix
    // because this is where it is compiled
    // remove it here `/mc`
    if (path && path.startsWith('/mc')) {
      path = path.substr(3);
    }

    actions.Log.addErrorMessage(`Break ${path}:${line}: ${message}`);

    const fileId = getIdByPath(state.Storage, path.substring(1));
    if (fileId) {
      actions.Editor.openFileOnBreakPoint({
        fileId,
        line,
        message
      });
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
  });
  deviceDebugger.on(XsbugMessageType.Log, msg => {
    actions.Log.addMessage(msg.log);
  });

  state.Device.debug.debugger = deviceDebugger;
});

export const createDeviceControll: Operator = mutate(({ state }) => {
  state.Device.control = new DeviceControl(state.Device.connection);
});

export const setupConnection: Operator<any> = pipe(
  createConnection,
  createDebugger,
  createDeviceControll
);

export const checkConnection: Operator<any> = pipe(
  when(({ state }) => state.Device.connection !== null, {
    true: connect,
    false: pipe(
      setupConnection,
      connect
    )
  })
);
export const doRestart: Operator = pipe(
  mutate(({ state }) => {
    state.Editor.activeBreakPoint = null;
    state.Device.debug.activeBreak = null;
    state.Device.control.doRestart();
  })
);

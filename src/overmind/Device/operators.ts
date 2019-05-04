import { run, mutate, Operator, pipe, when, noop } from 'overmind';
import { ConnectionState, DebugState } from './state';
import { cleanInstrumentData } from './utils';
import { SidebarView } from '../rootState';
import { getIdByPath } from '../Storage/utils';

export const createConnection: Operator<any> = mutate(({ state, effects }) => {
  const connection = effects.Device.connect(`ws://${state.Device.host}:8080`);

  connection.onConnectionError = () => {
    state.Device.connectionState = ConnectionState.ERROR;
  };

  connection.onClose = () => {
    state.Device.connectionState = ConnectionState.DISCONNECTED;
  };

  connection.onOpen = () => {
    state.Device.connectionState = ConnectionState.CONNECTED;
  };

  state.Device.connectionState = ConnectionState.CONNECTING;
  state.Device.connection = connection;
});

export const ensureConnected: Operator<any> = mutate(async ({ state }) => {
  if (state.Device.connectionState !== ConnectionState.CONNECTED) {
    await state.Device.connection.connect();
  }
});

export const addDebugger: Operator = mutate(({ state, actions }) => {
  const connection = state.Device.connection;
  connection.onInstrumentationConfigure = config => {
    state.Device.debug.instruments = cleanInstrumentData(config.instruments);
  };
  connection.onInstrumentationSamples = config => {
    if (!state.Device.debug.samples) {
      state.Device.debug.samples = config.samples.map(sample => [sample]);
    } else {
      config.samples.forEach((sample, index) => {
        state.Device.debug.samples[index].push(sample);
        state.Device.debug.samples[index].splice(
          0,
          state.Device.debug.samples[index].length - 100
        );
      });
    }
  };

  connection.onLogin = () => {
    state.Device.debug.state = DebugState.CONNECTED;
    actions.Log.addMessage('...done');
    connection.doGo();
  };

  connection.onBreak = async info => {
    const { path, line, message } = info;

    actions.Log.addErrorMessage(`Break ${path}:${line}: ${message}`);

    const fileId = getIdByPath(state.Storage, path.substring(1));
    if (fileId) {
      actions.Editor.openFileOnBreakPoint({
        fileId,
        line,
        message
      });
    }
    if (state.selectedSidebarView !== SidebarView.Debug) {
      actions.setActiveSidebarView(SidebarView.Debug);
    }
  };

  connection.onLog = msg => {
    actions.Log.addMessage(msg.log);
  };

  actions.Log.addMessage('Connect debugger...');
  state.Device.debug.state = DebugState.CONNECTING;
});

export const ensureConnection: Operator<any> = pipe(
  when(
    ({ state }) =>
      state.Device.connectionState !== ConnectionState.CONNECTED &&
      state.Device.connectionState !== ConnectionState.CONNECTING,
    {
      true: pipe(
        run(() => console.log('K')),
        createConnection,
        ensureConnected
      ),
      false: ensureConnected
    }
  )
);

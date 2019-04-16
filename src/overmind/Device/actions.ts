import { Action } from 'overmind';
import { DebugState } from './state';
import { SidebarView } from '../rootState';
import { getIdByPath } from '../Storage/utils';
import { cleanInstrumentData } from './utils';

export const setDeviceHostName: Action<string> = ({ state }, hostName) => {
  state.Device.host = hostName;
};

export const disconnectDebugger: Action = ({ state }) => {
  if (state.Device.debug.connection) {
    state.Device.debug.connection.disconnect();
  }
};

export const connectDebugger: Action = ({ state, effects, actions }) => {
  actions.Log.addMessage('Start debugging...');

  const debugConnection = effects.Device.connectDebugger(
    `ws://${state.Device.host}:8080`
  );

  debugConnection.onInstrumentationConfigure = config => {
    state.Device.debug.instruments = cleanInstrumentData(config.instruments);
  };

  debugConnection.onInstrumentationSamples = config => {
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

  debugConnection.onConnectionError = () => {
    state.Device.debug.state = DebugState.ERROR;
  };

  debugConnection.onClose = () => {
    state.Device.debug.state = DebugState.DISCONNECTED;
  };

  debugConnection.onLogin = () => {
    state.Device.debug.state = DebugState.CONNECTED;
    actions.Log.addMessage('...connected');
    debugConnection.doGo();
  };

  debugConnection.onBreak = async info => {
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

  debugConnection.onLog = msg => {
    actions.Log.addMessage(msg.log);
  };

  state.Device.debug.state = DebugState.CONNECTING;
  debugConnection.connect();

  state.Device.debug.connection = debugConnection;
};

export const debugContinue: Action = async ({ state }) => {
  state.Editor.activeBreakPoint = undefined;
  state.Device.debug.connection.doGo();
};

export const debugBreak: Action = ({ state }) => {
  state.Device.debug.connection.doStep();
};

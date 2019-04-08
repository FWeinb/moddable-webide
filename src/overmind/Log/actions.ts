import { Action } from 'overmind';
import { LogType } from './state';

export const addErrorMessage: Action<string> = ({ state }, message) => {
  state.Log.messages.push({
    type: LogType.ERROR,
    time: performance.now(),
    text: message
  });
};

export const addWarningMessage: Action<string> = ({ state }, message) => {
  state.Log.messages.push({
    type: LogType.WARNING,
    time: performance.now(),
    text: message
  });
};

export const addMessage: Action<string> = ({ state }, message) => {
  state.Log.messages.push({
    type: LogType.INFO,
    time: performance.now(),
    text: message
  });
};

export const clear: Action = ({ state }) => {
  state.Log.messages = [];
};

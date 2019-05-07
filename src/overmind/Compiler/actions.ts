import { Action, json } from 'overmind';
import { CompilerState } from './state';

export const load: Action = async ({ state, actions, effects }) => {
  const xscl = await effects.Compiler.load();
  state.Compiler.state = CompilerState.READY;
  xscl.addMessageListener(message => {
    if (message.type === 'error') {
      actions.Log.addErrorMessage(message.text);
    } else if (message.type === 'warning') {
      actions.Log.addWarningMessage(message.text);
    } else {
      actions.Log.addMessage(message.text);
    }
  });
};

export const compileAndUpload: Action = async ({ state, effects, actions }) => {
  await actions.Editor.saveAllFiles();

  try {
    state.Compiler.state = CompilerState.BUSY;
    const file: Uint8Array = await effects.Compiler.compile(
      json(state.Storage)
    );
    await actions.Device.installMod(file);
  } catch (e) {
    let message = e;
    if (e instanceof TypeError) {
      message = 'Could not connect to device.';
    }
    actions.Log.addErrorMessage('Error: ' + message);
  } finally {
    state.Compiler.state = CompilerState.READY;
  }
};

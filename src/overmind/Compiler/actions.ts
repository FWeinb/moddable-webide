import { Action, json } from 'overmind';
import { CompilerState } from './state';

export const load: Action = async ({ state, actions, effects }) => {
  const xscl = await effects.Compiler.load();
  state.Compiler.state = CompilerState.READY;
  xscl.addMessageListener(message => {
    if (message.type === 'error') {
      actions.Log.addMessage(message.text);
    } else {
      actions.Log.addMessage(message.text);
    }
  });
};

export const compileAndUpload: Action = async ({ state, effects, actions }) => {
  await actions.Editor.saveAllFiles();

  actions.Device.disconnectDebugger();

  try {
    const file: Uint8Array = await effects.Compiler.compile(
      json(state.Storage)
    );

    actions.Log.addMessage('Uploading...');

    // Enable debugging
    await fetch(`http://${state.Device.host}/mod/config/when/debug`);

    const response = await fetch(`http://${state.Device.host}/mod/install`, {
      method: 'PUT',
      body: file
    });

    const text = await response.text();

    actions.Log.addMessage('Done, Response: ' + text);

    await actions.Device.connectDebugger();
  } catch (e) {
    let message = e;
    if (e instanceof TypeError) {
      message = 'Could not connect to device.';
    }
    actions.Log.addErrorMessage('Error: ' + message);
  } finally {
    state.Compiler.errors = state.Log.messages
      .filter(message => message.text.startsWith('!!'))
      .map(message => message.text);
    state.Compiler.state = CompilerState.READY;
  }
};

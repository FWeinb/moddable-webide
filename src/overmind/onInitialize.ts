import { OnInitialize } from 'overmind';
import { File, CompilerState } from './state';
import { files as sampleFiles } from './defaultFiles';

export const onInitialize: OnInitialize = async ({
  state,
  effects,
  actions: { loadGist, loadFiles }
}) => {
  effects.loadCompiler().then(xscl => {
    state.compiler.state = CompilerState.READY;
    xscl.addMessageListener(message => {
      state.log.messages.push(message);
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const gistId = urlParams.get('gist');

  // TODO: Ask before loading gist
  if (gistId) {
    loadGist(gistId);
  } else {
    const localFiles = effects.loadFromLocalStorage();
    if (localFiles) {
      loadFiles(localFiles);
    }
  }
};

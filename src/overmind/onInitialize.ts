import { OnInitialize } from 'overmind';
import state from './Log/state';

export const onInitialize: OnInitialize = async ({
  state,
  effects,
  actions
}) => {
  // Load Compiler WASM
  actions.Compiler.load();

  const urlParams = new URLSearchParams(window.location.search);
  const gistId = urlParams.get('gist');

  if (gistId) {
    await effects.loadGist(gistId);
  } else {
    await actions.Storage.restoreFromLocalStorage();
    const modFile = Object.values(state.Storage.files).find(
      file => file.name === 'mod.js'
    );
    if (modFile) {
      actions.Editor.openFile(modFile.id);
    }
  }
};

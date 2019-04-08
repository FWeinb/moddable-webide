import { OnInitialize } from 'overmind';

export const onInitialize: OnInitialize = async ({ effects, actions }) => {
  // Load Compiler WASM
  actions.Compiler.load();

  const urlParams = new URLSearchParams(window.location.search);
  const gistId = urlParams.get('gist');

  // TODO: Ask before loading gist
  if (gistId) {
    await effects.loadGist(gistId);
  } else {
    const localFiles = effects.Editor.loadFromLocalStorage();
    if (localFiles) {
      await actions.Editor.loadFiles(localFiles);
    }
  }
};

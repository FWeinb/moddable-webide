import { Action, pipe, mutate, run } from 'overmind';

import * as o from './operators';
import { generateNodeId } from './utils';
import { XStorage } from './state';

export const openProject: Action<string> = (
  { state, actions },
  projectName
) => {
  actions.Editor.closeAllFiles();

  state.Storage.project = projectName;
  actions.Storage.restoreFromLocalStorage(projectName ? projectName : null);

  // Update url
  var newurl = location.origin + location.pathname + '?project=' + projectName;
  window.history.pushState(null, '', newurl);

  // Try open entry point
  const modFile = Object.values(state.Storage.files).find(
    file => file.name === 'mod.js'
  );
  if (modFile) {
    actions.Editor.openFile(modFile.id);
  }
};

export const removeProject: Action<string> = (
  { state, actions, effects },
  projectName
) => {
  if (state.Storage.project === projectName) {
    actions.Editor.closeAllFiles();
  }
  state.Storage.project = null;
  state.Storage.files = {};
  state.Storage.directories = {};

  effects.Storage.removeProject(projectName);

  // Update url
  var newurl = location.origin + location.pathname;
  window.history.pushState(null, '', newurl);
};

export const createNewFile: Action<string> = pipe(
  mutate(({ state, actions }, folderId) => {
    const name = window.prompt('File Name', 'unknown.js');
    if (name) {
      const id = generateNodeId();
      state.Storage.files[id] = {
        id,
        name,
        content: '',
        parent: folderId
      };
      actions.Editor.openFile(id);
    }
  }),
  o.persist
);

export const createNewFolder: Action<string> = pipe(
  mutate(({ state }, folderId) => {
    const name = window.prompt('Folder Name', 'New Folder');
    if (name) {
      const id = generateNodeId();
      state.Storage.directories[id] = {
        id,
        name,
        parent: folderId
      };
    }
  }),
  o.persist
);

export const updateFile: Action<{ id: string; content: string }> = pipe(
  mutate(({ state }, fileUpdate) => {
    const file = state.Storage.files[fileUpdate.id];
    if (file) {
      file.content = fileUpdate.content;
    }
  }),
  o.persist
);

export const addDroppedFiles: Action<File[]> = pipe(
  o.readDroppedFiles,
  o.mergeFilesIntoFiles,
  o.persist
);

export const removeDir: Action<string> = pipe(
  o.idtoDir,
  mutate(({ state, actions }, dir) => {
    if (dir === undefined) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the folder "${dir.name}"?`
    );
    if (confirmed) {
      Object.values(state.Storage.directories).forEach(d => {
        if (d.id === dir.id || d.parent === dir.id) {
          delete state.Storage.directories[d.id];
        }
      });

      Object.values(state.Storage.files).forEach(f => {
        if (f.id === dir.id || f.parent === dir.id) {
          actions.Editor.closeFile(f.id);
          delete state.Storage.files[f.id];
        }
      });
    }
  }),
  o.persist
);

// TODO: Reuse removeFile with argument
export const forceRemoveFile: Action<string> = pipe(
  o.idtoFile,
  mutate(({ state, actions }, file) => {
    if (file === undefined) return;
    actions.Editor.closeFile(file.id);
    delete state.Storage.files[file.id];
  }),
  o.persist
);

export const removeFile: Action<string> = pipe(
  o.idtoFile,
  mutate(({ state, actions }, file) => {
    if (file === undefined) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"?`
    );
    if (confirmed) {
      actions.Editor.closeFile(file.id);
      delete state.Storage.files[file.id];
    }
  }),
  o.persist
);

export const restoreFromLocalStorage: Action<string> = pipe(
  o.loadLocal,
  o.setFiles,
  o.persist
);

export const addFiles: Action<XStorage> = pipe(
  o.setFiles,
  run(({ state, actions }) => {
    state.Editor.openTabs.filter(t => actions.Editor.closeFile(t.id));
  }),
  o.persist
);

export const loadSampleData: Action<string> = pipe(
  o.getSampleFiles,
  o.setFiles,
  o.persist,
  run(({ state, actions }) => {
    const file = Object.values(state.Storage.files).find(
      f => f.name === 'mod.js'
    );
    actions.Editor.openFile(file.id);
  })
);

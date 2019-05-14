import { Action } from 'overmind';
import { EditorFile, EditorBreakpoint } from './state';

export const closeAllFiles: Action = ({ state, actions, effects }) => {
  actions.Editor.saveAllFiles();
  state.Editor.activeFile = null;
  state.Editor.openTabs = [];
  effects.Editor.disposeAllModels();
};

export const saveAllFiles: Action = ({ state, actions, effects }) => {
  const models = effects.Editor.getOpenModels(state.Storage);
  models.forEach(m => {
    actions.Editor.updateEditorFile({
      id: m.id,
      content: m.content,
      dirty: false
    });
  });
};

export const openFile: Action<string> = ({ state }, fileId) => {
  const file = state.Storage.files[fileId];
  if (file) {
    const openInTab = state.Editor.openTabs.find(
      openTab => openTab.id === file.id
    );
    if (openInTab) {
      state.Editor.activeFile = { ...openInTab };
    } else {
      state.Editor.activeFile = { id: file.id, dirty: false };
      state.Editor.openTabs.push({ id: file.id, dirty: false });
    }
  }
};

export const closeFile: Action<string> = (
  { state, actions, effects },
  fileId
) => {
  if (state.Editor.activeFile && state.Editor.activeFile.id === fileId) {
    state.Editor.activeFile = null;
  }

  state.Editor.openTabs = state.Editor.openTabs.filter(
    openTab => openTab.id !== fileId
  );

  if (state.Editor.openTabs.length > 0) {
    actions.Editor.openFile(
      state.Editor.openTabs[state.Editor.openTabs.length - 1].id
    );
  } else {
    state.Editor.activeFile = null;
  }

  const model = effects.Editor.getModel(
    state.Storage,
    state.Storage.files[fileId]
  );
  if (model) {
    actions.Storage.updateFile({
      id: fileId,
      content: model.getValue()
    });

    effects.Editor.removeModel(model);
  }
};
export const updateEditorFile: Action<EditorFile & { content?: string }> = (
  { state, actions },
  file
) => {
  if (
    state.Editor.activeFile &&
    state.Editor.activeFile.id === file.id &&
    state.Editor.activeFile.dirty !== file.dirty
  ) {
    state.Editor.activeFile.dirty = file.dirty;
  }
  const tab = state.Editor.openTabs.find(
    tab => tab.id === file.id && tab.dirty !== file.dirty
  );
  if (tab) {
    tab.dirty = file.dirty;
  }
  // Update content if changed
  if (file.content) {
    actions.Storage.updateFile({ id: file.id, content: file.content });
  }
};

export const toggleBreakpoint: Action<EditorBreakpoint> = (
  { state, actions },
  breakpoint
) => {
  breakpoint = state.Editor.breakpoints.find(
    otherBreakpoint =>
      breakpoint.fileId === otherBreakpoint.fileId &&
      breakpoint.line === otherBreakpoint.line
  );
  breakpoint.disabled = !breakpoint.disabled;
  if (breakpoint.disabled) {
    actions.Device.clearBreakpoint(breakpoint);
  } else {
    actions.Device.addBreakpoint(breakpoint);
  }
};

export const addBreakpoint: Action<EditorBreakpoint> = (
  { state, actions },
  breakpoint
) => {
  const find = state.Editor.breakpoints.findIndex(
    otherBreakpoint =>
      breakpoint.fileId === otherBreakpoint.fileId &&
      breakpoint.line === otherBreakpoint.line
  );

  if (find >= 0) {
    // Remove
    state.Editor.breakpoints.splice(find, 1);
    actions.Device.clearBreakpoint(breakpoint);
  } else {
    // Add
    state.Editor.breakpoints.push(breakpoint);
    actions.Device.addBreakpoint(breakpoint);
  }
};

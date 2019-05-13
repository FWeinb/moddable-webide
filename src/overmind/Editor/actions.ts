import { Action } from 'overmind';
import { EditorFile, EditorBreakpoint } from './state';
import { getIdByPath } from '../Storage/utils';

export const closeAllFiles: Action = ({ state, actions, effects }) => {
  actions.Editor.saveAllFiles();
  state.Editor.activeFile = undefined;
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

export const openFileByResourceInput: Action<any> = (
  { state, actions: { Editor } },
  input
) => {
  const id = getIdByPath(state.Storage, input.resource.path);
  Editor.openFile(id);
  state.Editor.openSelection = input.options;
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
    state.Editor.activeFile = undefined;
  }

  state.Editor.openTabs = state.Editor.openTabs.filter(
    openTab => openTab.id !== fileId
  );

  if (state.Editor.openTabs.length > 0) {
    actions.Editor.openFile(
      state.Editor.openTabs[state.Editor.openTabs.length - 1].id
    );
  } else {
    state.Editor.activeFile = undefined;
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

export const addBreakpoint: Action<EditorBreakpoint> = (
  { state, actions },
  breakpoint
) => {
  const find = state.Editor.breakpoints.findIndex(
    otherBreakpoint =>
      breakpoint.fileId === otherBreakpoint.fileId &&
      breakpoint.line === otherBreakpoint.line
  );

  // Only one active breakpoint
  if (breakpoint.active) {
    state.Editor.breakpoints = state.Editor.breakpoints.filter(
      otherBreakpoint => !otherBreakpoint.active
    );
  }

  if (find >= 0) {
    if (breakpoint.active) {
      // Update
      state.Editor.breakpoints[find] = breakpoint;
    } else {
      // Remove
      state.Editor.breakpoints.splice(find, 1);
      actions.Device.clearBreakpoint(breakpoint);
    }
  } else {
    // Add
    state.Editor.breakpoints.push(breakpoint);
    if (!breakpoint.active) {
      actions.Device.addBreakpoint(breakpoint);
    }
  }
  console.log(state.Editor.breakpoints);
};

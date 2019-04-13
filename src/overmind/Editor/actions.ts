import { Action } from 'overmind';
import { BreakPoint, EditorFile } from './state';

export const closeAllFiles: Action = ({ state }) => {
  state.Editor.activeFile = undefined;
  state.Editor.openTabs = [];
};

export const saveAllFiles: Action = ({ actions, effects }) => {
  const models = effects.Editor.getOpenModels();
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
  if (state.Editor.activeFile.id === fileId) {
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

export const openFileOnBreakPoint: Action<BreakPoint> = (
  { state, actions },
  breakPoint
) => {
  state.Editor.activeBreakPoint = breakPoint;
};

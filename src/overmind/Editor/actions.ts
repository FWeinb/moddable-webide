import { Action } from 'overmind';
import { BreakPoint } from './state';
import { FileMap, File } from '../rootState';

export const addFile: Action = ({ state, actions }) => {
  const name = window.prompt('File Name', 'unknown.js');
  if (name) {
    state.Editor.files[name] = {
      name,
      content: '',
      dirty: false,
      open: false
    };
    actions.Editor.openFile(name);
  }
};

export const removeFile: Action<string> = (
  { state, actions, effects },
  fileName
) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${fileName}"?`
  );
  if (confirmed) {
    actions.Editor.closeFile(fileName);
    delete state.Editor.files[fileName];
    effects.Editor.saveToLocalStorage(state.Editor.files);
  }
};

export const closeAllFiles: Action = ({ state }) => {
  state.Editor.files = {};
  state.Editor.openFile = undefined;
  state.Editor.openTabs = [];
};

export const loadFiles: Action<FileMap> = ({ state, actions }, files) => {
  state.Editor.files = files;
  state.Editor.openTabs = Object.values(files)
    .filter(file => file.open)
    .map(file => file.name);

  if (state.Editor.openTabs.length > 0) {
    actions.Editor.openFile(state.Editor.openTabs[0]);
  } else {
    actions.Editor.openFile(Object.values(state.Editor.files)[0].name);
  }
};

export const openFile: Action<string> = ({ state, effects }, fileName) => {
  const file = state.Editor.files[fileName];
  if (file) {
    file.open = true;
    state.Editor.openFile = file.name;
    if (!state.Editor.openTabs.some(openTab => openTab === file.name)) {
      state.Editor.openTabs.push(file.name);
    }
    effects.Editor.saveToLocalStorage(state.Editor.files);
  }
};

export const openFileOnBreakPoint: Action<BreakPoint> = (
  { state: { Editor: EditorState }, actions: { Editor: EditorActions } },
  breakPoint
) => {
  if (EditorState.files[breakPoint.path]) {
    EditorActions.openFile(breakPoint.path);
    EditorState.activeBreakPoint = breakPoint;
  }
};

export const closeFile: Action<string> = (
  { state, actions, effects },
  fileName
) => {
  const file = state.Editor.files[fileName];
  if (file) {
    file.open = false;
    state.Editor.openTabs = state.Editor.openTabs.filter(
      openTab => state.Editor.files[openTab].open
    );

    if (state.Editor.openTabs.length > 0) {
      actions.Editor.openFile(
        state.Editor.openTabs[state.Editor.openTabs.length - 1]
      );
    } else {
      state.Editor.openFile = undefined;
    }

    effects.Editor.saveToLocalStorage(state.Editor.files);
  }
};

type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;

type FileWithOptionalProps = Overwrite<
  File,
  { content?: string; open?: boolean }
>;

export const updateFile: Action<FileWithOptionalProps> = (
  { state, effects },
  file
) => {
  const { name, content, dirty } = file;

  if (content) {
    state.Editor.files[name].content = content;
  }

  state.Editor.files[name].dirty = dirty;

  const openFile =
    state.Editor.files[
      state.Editor.openTabs.find(fileName => fileName === name)
    ];

  if (openFile) {
    openFile.dirty = dirty;
  }

  effects.Editor.saveToLocalStorage(state.Editor.files);
};

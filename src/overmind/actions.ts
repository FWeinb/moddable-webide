import { Action } from 'overmind';
import { files as sampleFiles } from './defaultFiles';
import { File, CompilerState, FileMap } from './state';
import { VALUE } from 'proxy-state-tree';

// Sample Data
export const loadSampleData: Action = ({ state, actions }) => {
  actions.loadFiles(JSON.parse(JSON.stringify(sampleFiles)));
};

// Gist
export const loadGist: Action<string> = async (
  { actions, effects },
  gistId
) => {
  actions.loadFiles(await effects.loadGist(gistId));
};

export const openGist: Action = ({ actions }) => {
  const gistId = window.prompt('Input GistId:');
  if (gistId) {
    actions.loadGist(gistId);
  }
};

// Device
export const setDeviceHostName: Action<string> = ({ state }, hostName) => {
  state.device.host = hostName;
};

// Compiler
export const compileAndUpload: Action = async ({ state, effects }) => {
  state.log.messages = [];
  state.compiler.state = CompilerState.BUSY;
  try {
    const file = await effects.compile(
      Object.values(state.editor.files).map(file => file[VALUE])
    );

    state.log.messages.push({
      type: 'log',
      time: Date.now(),
      text: 'Uploading...'
    });

    const response = await fetch(`http://${state.device.host}/mod/install`, {
      method: 'PUT',
      body: file
    });

    const text = await response.text();

    state.log.messages.push({
      type: 'log',
      time: Date.now(),
      text: 'Done, Response: ' + text
    });
  } catch (e) {
    let message = e;
    if (e instanceof TypeError) {
      message = 'Could not connect to device.';
    }
    state.log.messages.push({
      type: 'error',
      time: Date.now(),
      text: 'Error: ' + message
    });
  } finally {
    state.compiler.errors = state.log.messages
      .filter(message => message.text.startsWith('!!'))
      .map(message => message.text);
    state.compiler.state = CompilerState.READY;
  }
};

export const connectDebugger: Action = ({ state, effects }) => {
  state.log.messages.push({
    type: 'debug',
    time: Date.now(),
    text: 'Start debugging...'
  });

  const xsbug = effects.connectDebugger(`ws://${state.device.host}:8080`);

  xsbug.onInstrumentationConfigure = config => {
    state.device.instruments = config.instruments;
  };

  xsbug.onInstrumentationSamples = config => {
    state.device.stats = config.samples;
  };

  xsbug.onLogin = () => {
    xsbug.doGo();
  };

  xsbug.onLog = msg => {
    state.log.messages.push({
      type: 'debug',
      time: Date.now(),
      text: msg.log
    });
  };

  state.device.xsbug = xsbug;
};

// Editor

export const removeFiles: Action = async ({ state }) => {
  state.editor.files = {};
  state.editor.currentFileName = undefined;
  state.editor.openFiles = [];
};

export const loadFiles: Action<FileMap> = ({ state, actions }, files) => {
  state.editor.files = files;
  state.editor.openFiles = Object.values(files).filter(file => file.open);
  if (state.editor.openFiles.length > 0) {
    actions.openFile(state.editor.openFiles[0].name);
  } else {
    actions.openFile(Object.values(state.editor.files)[0].name);
  }
};

export const openFile: Action<string> = ({ state, effects }, fileName) => {
  const file = state.editor.files[fileName];
  file.open = true;
  state.editor.currentFileName = file.name;
  if (!state.editor.openFiles.some(openFile => openFile.name === file.name)) {
    state.editor.openFiles.push(file);
  }
  effects.saveToLocalStorage(state.editor.files);
};

export const closeFile: Action<string> = (
  { state, actions: { openFile }, effects },
  fileName
) => {
  state.editor.files[fileName].open = false;
  state.editor.openFiles = state.editor.openFiles.filter(
    openFile => openFile.open
  );
  if (state.editor.openFiles.length > 0) {
    openFile(state.editor.openFiles[state.editor.openFiles.length - 1].name);
  } else {
    state.editor.currentFileName = undefined;
  }

  effects.saveToLocalStorage(state.editor.files);
};

type Overwrite<T1, T2> = { [P in Exclude<keyof T1, keyof T2>]: T1[P] } & T2;

export const updateFile: Action<
  Overwrite<File, { content?: string; open?: boolean }>
> = ({ state, effects }, file) => {
  const { name, content, dirty } = file;
  if (content) {
    state.editor.files[name].content = content;
  }
  state.editor.files[name].dirty = dirty;

  const openFile = state.editor.openFiles.find(file => file.name === name);
  if (openFile) {
    openFile.dirty = dirty;
  }

  effects.saveToLocalStorage(state.editor.files);
};

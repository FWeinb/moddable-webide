import { mutate, run, map, Operator } from 'overmind';
import { XFile, XStorage, Directory } from './state';
import { generateNodeId } from './utils';

export const setFiles: Operator<XStorage> = mutate(
  ({ state }, { files, directories }) => {
    state.Storage.files = files;
    state.Storage.directories = directories;
  }
);

export const idtoFile: Operator<string, XFile> = map(({ state }, fileId) => {
  return state.Storage.files[fileId];
});

export const idtoDir: Operator<string, Directory> = map(({ state }, dirId) => {
  return state.Storage.directories[dirId];
});

export const mergeFilesIntoFiles: Operator<XFile[]> = mutate(
  ({ state, actions }, newFiles) => {
    const newFileNames = newFiles.map(file => file.name);
    const existing = Object.values(state.Storage.files).filter(file =>
      newFileNames.includes(file.name)
    );
    if (existing.length > 0) {
      const overwrite = window.confirm(
        `Do you want to overwrite ${existing.map(f => f.name).join(',')} files?`
      );
      if (overwrite === true) {
        existing.forEach(f => actions.Storage.forceRemoveFile(f.id));
      } else {
        return;
      }
    }
    newFiles.forEach(file => {
      state.Storage.files[file.id] = file;
    });
  }
);

export const persist: Operator = run(({ state, effects }) => {
  effects.Storage.saveToLocalStorage(state.Storage);
});

export const loadLocal: Operator<void, XStorage> = map(({ effects }) => {
  return (
    effects.Storage.loadFromLocalStorage() || {
      directories: {},
      files: {}
    }
  );
});

export const getSampleFiles: Operator<void, XStorage> = map(async ({}) => {
  const { files } = await import('./defaultFiles');
  return files;
});

export const readDroppedFiles: Operator<File[], XFile[]> = map(
  async (_, files) => {
    // TODO: Handle creation of directories here
    return await Promise.all(
      files.map(async file => ({
        id: generateNodeId(),
        name: file.name,
        content: await readFile(file)
      }))
    );
  }
);

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

import { XStorage, Directory, XFile } from './state';
import { files } from './defaultFiles';

// FRom https://gist.github.com/jed/982883
export const generateNodeId = () => {
  // @ts-ignore
  return String([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      parseFloat(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] &
        (15 >> (parseFloat(c) / 4)))
    ).toString(16)
  );
};

const getPathFragment = (storage: XStorage, id: string, path: string[]) => {
  const file = storage.files[id];
  if (file) {
    path.push(file.name);
    return getPathFragment(storage, file.parent, path);
  }
  const dir = storage.directories[id];
  if (dir) {
    path.push(dir.name);
    return getPathFragment(storage, dir.parent, path);
  }

  return path;
};

export const getPath = (storage: XStorage, id: string) => {
  return getPathFragment(storage, id, [])
    .reverse()
    .join('/');
};

const getIdForPath = (
  dirs: Directory[],
  files: XFile[],
  path: string[],
  parentId: string
) => {
  const currPath = path.shift();
  if (path.length > 0) {
    const dir = dirs.find(
      dir => dir.name === currPath && dir.parent === parentId
    );

    return getIdForPath(dirs, files, path, dir.id);
  }
  const file = files.find(f => f.name === currPath && f.parent === parentId);
  return file.id;
};

export const getIdByPath = (storage: XStorage, path: string) => {
  const dirs = Object.values(storage.directories);
  const files = Object.values(storage.files);
  const parts = path.split('/').filter(l => l.length > 0);
  return getIdForPath(dirs, files, parts, undefined);
};

export const isFilePartOf = (
  storage: XStorage,
  parentId: string,
  fileId: string
) => {
  // TODO: This is not done yet
  // Just working for one level
  if (parentId === undefined) return false;

  const file = storage.files[fileId];
  if (file) {
    if (file.parent === parentId) {
      return true;
    }
  }
  return false;
};

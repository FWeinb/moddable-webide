import localforage from 'localforage';
import { XStorage } from './state';
import { json } from 'overmind';
const storageKey = 'storage';

var projectStorage = localforage.createInstance({
  name: 'Storage'
});

const getProjectStorageKey = (project: string) => {
  return project ? project + `.${storageKey}` : storageKey;
};

export const hasProject = async (project: string) => {
  try {
    if (await projectStorage.getItem(getProjectStorageKey(project))) {
      return true;
    }
  } catch {
    return false;
  }
};

export const getProjectList = async () => {
  const keys = await projectStorage.keys();
  return keys
    .filter(key => key.endsWith('.' + storageKey))
    .map(key => key.substr(0, key.indexOf('.')));
};

export const removeProject = async (project: string) => {
  await projectStorage.removeItem(getProjectStorageKey(project ? project : ''));
};

export const saveToLocalStorage = async (storage: XStorage) => {
  await projectStorage.setItem(
    getProjectStorageKey(storage.project),
    json(storage)
  );
};

export const loadFromLocalStorage = (project: string): Promise<XStorage> => {
  return projectStorage.getItem(getProjectStorageKey(project));
};

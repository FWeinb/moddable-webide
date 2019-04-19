import { XStorage } from './state';
const storageKey = 'storage';

const getProjectStorageKey = (project: string) => {
  return project ? project + `.${storageKey}` : storageKey;
};

export const hasProject = (project: string) => {
  if (localStorage.getItem(getProjectStorageKey(project))) {
    return true;
  }
  return false;
};

export const getProjectList = () => {
  return Object.keys(localStorage)
    .filter(key => key.endsWith('.' + storageKey))
    .map(key => key.substr(0, key.indexOf('.')));
};

export const removeProject = (project: string) => {
  localStorage.removeItem(getProjectStorageKey(project));
};

export const saveToLocalStorage = (storage: XStorage) => {
  localStorage.setItem(
    getProjectStorageKey(storage.project),
    JSON.stringify(storage)
  );
};

export const loadFromLocalStorage = (project: string): XStorage => {
  const data = JSON.parse(
    localStorage.getItem(getProjectStorageKey(project))
  ) as XStorage;
  return data;
};

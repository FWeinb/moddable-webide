import { XStorage } from './state';

export const saveToLocalStorage = (storage: XStorage) => {
  localStorage.setItem('storage', JSON.stringify(storage));
};

export const loadFromLocalStorage = (): XStorage => {
  const data = JSON.parse(localStorage.getItem('storage')) as XStorage;
  return data;
};

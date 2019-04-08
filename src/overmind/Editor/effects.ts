import XsbugConnection from '../../xs/XsbugConnection';
import { FileMap } from '../rootState';

export const saveToLocalStorage = (files: FileMap) => {
  localStorage.setItem('files', JSON.stringify(files));
};

export const loadFromLocalStorage = (): FileMap => {
  return JSON.parse(localStorage.getItem('files')) as FileMap;
};

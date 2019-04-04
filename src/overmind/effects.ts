import { FileMap, File } from './state';
import XSCL from '../xs/index';
import XsbugConnection from '../xs/XsbugConnection';

export const loadGist = async (gistId: string): Promise<FileMap> => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`);
  const data = await response.json();

  return Object.values(data.files).reduce((acc, file: any) => {
    acc[file.filename] = {
      name: file.filename,
      content: file.content,
      dirty: false
    };
    return acc;
  }, {}) as FileMap;
};

export const saveToLocalStorage = (files: FileMap) => {
  localStorage.setItem('files', JSON.stringify(files));
};

export const loadFromLocalStorage = (): FileMap => {
  return JSON.parse(localStorage.getItem('files')) as FileMap;
};

// TODO: Singelton, bad
let xscl: XSCL;

export const loadCompiler = (): Promise<XSCL> => {
  xscl = new XSCL();
  return new Promise((resolve, reject) => {
    xscl.addOnloadListener(() => {
      resolve(xscl);
    });
  });
};

export const compile = async (files: File[]): Promise<Uint8Array> => {
  const compiledFiles = await xscl.compile(files);
  return await xscl.link(compiledFiles);
};

export const connectDebugger = (url: string): XsbugConnection => {
  return new XsbugConnection(url);
};

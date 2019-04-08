import XSCL from '../../xs';
import { File } from '../rootState';

let xscl: XSCL;

export const load = (): Promise<XSCL> => {
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

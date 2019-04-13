import XSCL from '../../xs';
import { XStorage } from '../Storage/state';

let xscl: XSCL;

export const load = (): Promise<XSCL> => {
  xscl = new XSCL();
  return new Promise((resolve, reject) => {
    xscl.addOnloadListener(() => {
      resolve(xscl);
    });
  });
};

export const compile = async (storage: XStorage): Promise<Uint8Array> => {
  const compiledFiles = await xscl.compile(storage);
  return await xscl.link(compiledFiles);
};
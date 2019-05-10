import { XStorage } from '../Storage/state';

// Dynamic typing of this is needed
let xscl: import('../../xs').Compiler;

export const load = async (): Promise<typeof xscl> => {
  xscl = new (await import(
    /* webpackChunkName: "xsTools" */ '../../xs'
  )).Compiler();
  return new Promise((resolve, reject) => {
    xscl.addOnloadListener(() => {
      resolve(xscl);
    });
  });
};

export const compile = (storage: XStorage): Promise<Uint8Array> => {
  return xscl.compile(storage);
};

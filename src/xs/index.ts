import XsclWorker from './xscl.worker.js';

type FileObject = {
  name: string;
  content: string;
};

type MessageType = {
  type: 'error' | 'log';
  time: number;
  text: string;
};

export default class XSCL {
  worker: Worker;
  loaded: boolean;

  constructor() {
    this.worker = new XsclWorker();
    this.loaded = false;
  }
  addOnloadListener(callback: VoidFunction) {
    if (this.loaded) return callback();

    this.worker.addEventListener('message', message => {
      const { data } = message;
      if (data.type === 'loaded') {
        this.loaded = true;
        callback();
      }
    });
  }
  /**
   * Files
   *
   *    [
   *      {name:'', content: ''},
   *    ]
   *
   */
  compile(files: FileObject[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.worker.postMessage({
        fn: 'compile',
        input: files
      });
      this.worker.onmessage = message => {
        const { data } = message;
        if (data.type === 'cResponse') {
          this.worker.onmessage = undefined;
          if (data.result.status === 'success') {
            resolve(data.result.data);
          } else {
            reject('Compiling failed');
          }
        }
      };
    });
  }

  link(files: string[]): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      this.worker.postMessage({
        fn: 'link',
        input: files
      });
      this.worker.onmessage = message => {
        const { data } = message;
        if (data.type === 'lResponse') {
          this.worker.onmessage = undefined;
          if (data.result.status === 'success') {
            resolve(data.result.data);
          } else {
            reject('Linking failed');
          }
        }
      };
    });
  }

  addMessageListener(callback: (message: MessageType) => void) {
    this.worker.addEventListener('message', message => {
      const { data } = message;
      if (data.type === 'error' || data.type === 'log') {
        callback(data);
      }
    });
  }
}

import ToolsWorker from './tools.xworker';
import { XStorage } from '../overmind/Storage/state';

type MessageType = {
  type: 'error' | 'warning' | 'log';
  text: string;
};

export default class Compiler {
  worker: Worker;
  loaded: boolean;

  constructor() {
    this.worker = new ToolsWorker();
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
  compile(files: XStorage): Promise<Uint8Array> {
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

  addMessageListener(callback: (message: MessageType) => void) {
    this.worker.addEventListener('message', message => {
      const { data } = message;
      if (
        data.type === 'error' ||
        data.type === 'warning' ||
        data.type === 'log'
      ) {
        callback(data);
      }
    });
  }
}

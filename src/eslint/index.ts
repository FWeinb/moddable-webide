import EslintWorker from './eslint.xworker';
import monaco from '../components/Editor/monaco';

export default class ESLint {
  worker: Worker;
  constructor() {
    this.worker = new EslintWorker();
  }
  verify(code, config, options?): Promise<monaco.editor.IMarkerData[]> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = message => {
        resolve(message.data);
        this.worker.onmessage = null;
      };
      this.worker.postMessage({ code, config, options });
    });
  }
}

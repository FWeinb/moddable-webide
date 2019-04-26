import xsclEmscripten from './xscl.js';
import xsclWasm from './xscl.wasm';

const XSLC = new Promise((resolve, reject) => {
  xsclEmscripten({
    printErr: text => {
      self.postMessage({
        type: 'error',
        text
      });
    },
    locateFile: () => xsclWasm
  }).then(xsclModule => {
    xsclModule.FS.mkdir('/build');

    const compile = xsclModule.cwrap('compile', 'number', ['string']);
    const link = xsclModule.cwrap('fxLink', 'number', ['string', 'string']);

    resolve({
      FS: xsclModule.FS,
      compile,
      link
    });
    self.postMessage({ type: 'loaded' });
  });
});

self.onmessage = message => {
  const { data } = message;
  if (!data) return;
  if (data.fn === 'compile') {
    XSLC.then(xscl => {
      const { input: files } = data; // files: Files

      function writeDirAndFiles(parentId, path) {
        let filePaths = [];
        Object.values(files.directories).forEach(dir => {
          if (dir.parent === parentId) {
            try {
              xscl.FS.mkdir(path + dir.name);
            } catch (e) {
              // it's okay if that folder exists
            }
            filePaths = filePaths.concat(
              writeDirAndFiles(dir.id, path + dir.name + '/')
            );
          }
        });
        Object.values(files.files).forEach(file => {
          if (file.parent === parentId) {
            const filePath = path + file.name;
            if (file.binary) {
              xscl.FS.writeFile(filePath, new Uint8Array(file.content), {
                encoding: 'binary'
              });
            } else {
              xscl.FS.writeFile(filePath, file.content);
            }
            filePaths.push(filePath);
          }
        });
        return filePaths;
      }

      const filePaths = writeDirAndFiles(undefined, '/');
      const exitCodes = filePaths
        .filter(path => path.endsWith('.js'))
        .map(filePath => {
          self.postMessage({
            type: 'log',
            text: 'Compile: ' + filePath
          });
          return xscl.compile(filePath);
        });

      const error = exitCodes.some(exitCode => exitCode !== 0);

      self.postMessage({
        type: 'cResponse',
        result: error
          ? { status: 'error' }
          : {
              status: 'success',
              data: xscl.FS.readdir('/build')
                .filter(name => name.endsWith('.xsb'))
                .map(name => '/build/' + name)
            }
      });
    });
  } else if (data.fn === 'link') {
    XSLC.then(xscl => {
      const { input: files } = data;
      const filesToLink = files.join(',');
      self.postMessage({
        type: 'log',
        text: 'Link: ' + filesToLink
      });
      const exitCode = xscl.link(filesToLink, 'mod');
      const result = xscl.FS.readFile('/build/mod.xsa');
      self.postMessage({
        type: 'lResponse',
        result:
          exitCode === 0
            ? {
                status: 'success',
                data: result
              }
            : {
                status: 'error'
              }
      });
    });
  }
};

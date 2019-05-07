import toolsEmscripten from './tools.js';
import toolsWasm from './tools.wasm';

const report = (text, type = 'log') => {
  self.postMessage({
    type: type,
    text
  });
};

const Tools = new Promise((resolve, reject) => {
  toolsEmscripten({
    printErr: text => {
      report(text, text.startsWith('# warning:') ? 'warning' : 'error');
    },
    locateFile: () => toolsWasm
  }).then(tools => {
    const callMain = tools.callMain;
    resolve({
      FS: tools.FS,
      callMain
    });
    self.postMessage({ type: 'loaded' });
  });
});

self.onmessage = message => {
  const { data } = message;
  if (!data) return;
  Tools.then(tools => {
    const { input: files } = data; // files: Files

    function writeDirAndFiles(parentId, path) {
      Object.values(files.directories).forEach(dir => {
        if (dir.parent === parentId) {
          try {
            tools.FS.mkdir(path + dir.name);
          } catch (e) {
            // it's okay if that folder exists
          }
          writeDirAndFiles(dir.id, path + dir.name + '/');
        }
      });
      Object.values(files.files).forEach(file => {
        if (file.parent === parentId) {
          const filePath = path + file.name;
          if (file.binary) {
            tools.FS.writeFile(filePath, new Uint8Array(file.content), {
              encoding: 'binary'
            });
          } else {
            tools.FS.writeFile(filePath, file.content);
          }
        }
      });
    }

    try {
      tools.FS.rmdir('/mc');
    } catch (e) {}
    tools.FS.mkdir('/mc');

    writeDirAndFiles(undefined, '/mc/');

    report('mcrun -d /mc/manifest.json');
    tools.callMain(['mcrun', '-d', '/mc/manifest.json']);

    let make = JSON.parse(
      tools.FS.readFile('/moddable/build/tmp/wasm/debug/mc/make.json', {
        encoding: 'utf8'
      })
    );
    for (let command of make) {
      report(command.join(' '));
      tools.callMain(command);
    }

    let archive = tools.FS.readFile('/moddable/build/bin/wasm/debug/mc/mc.xsa');

    self.postMessage({
      type: 'cResponse',
      result: {
        status: 'success',
        data: archive
      }
    });
  });
};

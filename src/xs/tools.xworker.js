import toolsEmscripten from './tools.js';
import toolsWasm from './tools.wasm';

const Tools = new Promise((resolve, reject) => {
  toolsEmscripten({
    printErr: text => {
      report(text, text.startsWith('# warning:') ? 'warning' : 'error');
    },
    locateFile: () => toolsWasm,
    postRun: () => {}
  }).then(tools => {
    resolve(
      Object.freeze({
        FS: tools.FS,
        callMain: tools.callMain
      })
    );

    // This is called to early
    setTimeout(() => {
      self.postMessage({ type: 'loaded' });
    }, 1500);
  });
});

self.onmessage = message => {
  const { data } = message;
  if (!data) return;
  Tools.then(tools => {
    try {
      const { input: files } = data; // files: Files

      prepareBeforeCompilation(tools.FS);

      writeDirAndFiles(tools.FS, files, '/mc/');

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

      let archive = tools.FS.readFile(
        '/moddable/build/bin/wasm/debug/mc/mc.xsa'
      );

      // Cleanup files
      cleanupAfterCompilation(tools.FS);

      self.postMessage({
        type: 'cResponse',
        result: {
          status: 'success',
          data: archive
        }
      });
    } catch (e) {
      self.postMessage({
        type: 'cResponse',
        result: {
          status: 'error',
          error: '' + e
        }
      });
    }
  });
};

function report(text, type = 'log') {
  self.postMessage({
    type: type,
    text
  });
}

function deleteFolderRecursive(FS, path) {
  if (FS.lookupPath(path).node !== null) {
    FS.readdir(path).forEach(function(file) {
      if (file === '.' || file === '..') return;
      var curPath = path + '/' + file;
      if (FS.isDir(FS.stat(curPath).mode)) {
        deleteFolderRecursive(FS, curPath);
      } else {
        FS.unlink(curPath);
      }
    });
    FS.rmdir(path);
  }
}

function prepareBeforeCompilation(FS) {
  FS.chdir('/');
  FS.mkdir('/mc');
}

function writeDirAndFiles(FS, files, path, parentId) {
  Object.values(files.directories).forEach(dir => {
    if (dir.parent === parentId) {
      FS.mkdir(path + dir.name);
      writeDirAndFiles(FS, files, path + dir.name + '/', dir.id);
    }
  });
  Object.values(files.files).forEach(file => {
    if (file.parent === parentId) {
      const filePath = path + file.name;
      if (file.binary) {
        FS.writeFile(filePath, new Uint8Array(file.content), {
          encoding: 'binary'
        });
      } else {
        FS.writeFile(filePath, file.content);
      }
    }
  });
}
function cleanupAfterCompilation(FS) {
  FS.chdir('/');
  try {
    deleteFolderRecursive(FS, '/mc');
  } catch (e) {}
  try {
    deleteFolderRecursive(FS, '/moddable');
  } catch (e) {}
}

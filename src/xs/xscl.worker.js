import xsclEmscripten from './xscl.js';
import xsclWasm from './xscl.wasm';

const XSLC = new Promise((resolve, reject) => {
  xsclEmscripten({
    printErr: text => {
      self.postMessage({
        type: 'error',
        time: Date.now() + Math.random(),
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
      const { input: files } = data;
      const exitCodes = files.map(file => {
        xscl.FS.writeFile(file.name, file.content);
        // TODO: Better to pass all files at once
        // Calling JS/C is a bottleneck
        self.postMessage({
          type: 'log',
          time: Date.now() + Math.random(),
          text: 'Compile: ' + file.name
        });
        return xscl.compile(file.name);
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
        time: Date.now() + Math.random(),
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

/*import xscEmscripten from './xs/xsc.js';
import xscWasm from './xs/xsc.wasm';

import xslEmscripten from './xs/xsl.js';
import xslWasm from './xs/xsl.wasm';

let xsc, xsl;
const Loaded = cb => {
  if (xsc && xsl) return cb(xsc, xsl);
  xscEmscripten({
    printErr: text => {
      self.postMessage({ type: 'error', from: 'xsc', text });
    },
    locateFile: () => xscWasm
  }).then(_xsc => {
    const xslModule = {
      preRun: () => {
        BrowserFS.getFileSystem(
          {
            fs: 'FolderAdapter',
            options: {
              folder: '/build',
              wrapped: {
                fs: 'Emscripten',
                options: {
                  FS: xslModule.FS
                }
              }
            }
          },
          (err, fs) => {
            console.log(fs);
          }
        );
      },
      printErr: text => {
        self.postMessage({ type: 'error', from: 'xsc', text });
      },
      locateFile: () => xslWasm
    };

    xslEmscripten(xslModule).then(_xsl => {
      // XSC/XSL Loaded
      xsc = _xsc;
      xsl = _xsl;

      xsc.FS.mkdir('/build');

      self.postMessage({ type: 'loaded' });
    });
  });
};

self.onmessage = message => {
  const { data } = message;
  if (!data) return;
  if (data.fn === 'compile') {
    Loaded(xsc => {
      const { input: code } = data;
      xsc.FS.writeFile('mod.js', code);
      xsc.callMain(['mod.js', '-d', '-e', '-o', '/build']);

      //xsl.FS.writeFile('/build/mod.xsb', xsc.FS.readFile('/build/mod.xsb'));

      xsl.callMain([
        '-a',
        '-b',
        '/build',
        '-o',
        '/build',
        '-r',
        'mod',
        '/build/mod.xsb'
      ]);

      const result = xsl.FS.readFile('/build/mod.xsa');

      self.postMessage({
        type: 'response',
        result
      });
    });
  }
};

// Start loading
Loaded(() => {});
*/

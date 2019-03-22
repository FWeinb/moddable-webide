/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';
import FlashIcon from './FlashIcon';
import { CompilerState, File } from '../../overmind/state';

const FileTab: React.FunctionComponent<{
  file: File;
  open: boolean;
  onOpen: VoidFunction;
  onClose: VoidFunction;
}> = ({ file, open, onOpen, onClose }) => {
  // Adopt tracking of file
  useOvermind();

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '.25em .5em',
        cursor: 'pointer'
      }}
      style={open ? { background: 'var(--color-background)' } : undefined}
    >
      <div onClick={() => !open && onOpen()} css={{ marginRight: '1em' }}>
        {file ? file.name + (file.dirty ? '*' : '') : ''}
      </div>
      <div onClick={() => onClose()}>×</div>
    </div>
  );
};

const EditorTopBar: React.FunctionComponent = () => {
  const {
    actions: { setDeviceHostName, compileAndUpload, openFile, closeFile },
    state: {
      device: { host },
      editor: { openFiles, currentFile },
      compiler: { state }
    }
  } = useOvermind();

  const compilerNotReady = state !== CompilerState.READY;

  return (
    <section
      css={{
        display: 'flex',
        flexDirection: 'row',
        flex: '0 0 auto',
        alignItems: 'center',
        height: '40px',
        width: '100%',
        position: 'relative',
        background: '#333333'
      }}
    >
      <header
        css={{
          display: 'flex',
          flexDirection: 'row',
          color: '#fff',
          height: '100%',
          fontSize: '0.9em'
        }}
      >
        {openFiles.map(file => {
          return (
            <FileTab
              key={file.name}
              file={file}
              open={currentFile && file.name === currentFile.name}
              onOpen={() => openFile(file.name)}
              onClose={() => closeFile(file.name)}
            />
          );
        })}
      </header>
      <section
        css={{
          display: 'flex',
          height: '100%',
          flexGrow: 0,
          alignItems: 'center',
          margin: '0 0 0 auto',
          background: '#2a2a2b',
          padding: '0 0 0 10px',
          transition: 'opacity 250ms ease'
        }}
        style={{
          opacity: currentFile ? 1 : 0
        }}
      >
        <input
          onChange={e => setDeviceHostName(e.target.value)}
          type="text"
          value={host}
          placeholder="Hostname/IP"
          css={{
            border: '0',
            height: '2.5em',
            padding: '0 5px',
            backgroundColor: 'rgb(60, 60, 60)',
            color: 'rgb(204, 204, 204)',
            caretColor: 'rgb(204, 204, 204)',
            '::placeholder': {
              color: 'rgb(204, 204, 204)'
            }
          }}
        />
        <button
          onClick={compileAndUpload}
          disabled={compilerNotReady}
          title="Flash"
          css={{
            webkitAppearance: 'none',
            all: 'unset',
            cursor: 'pointer',
            margin: '0 0.5em'
          }}
          style={{
            opacity: compilerNotReady ? 0.1 : 1
          }}
        >
          <FlashIcon />
        </button>
      </section>
    </section>
  );
};

export default EditorTopBar;

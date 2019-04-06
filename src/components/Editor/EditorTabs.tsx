/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';
import FlashIcon from '../Icons/FlashIcon';
import { CompilerState, File } from '../../overmind/state';
import { connectDebugger } from '../../overmind/actions';

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
      style={open ? { background: 'var(--color-darkest)' } : undefined}
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
    actions: { openFile, closeFile },
    state: {
      editor: { openFiles, currentFile }
    }
  } = useOvermind();

  return (
    <section
      css={{
        display: 'flex',
        flexDirection: 'row',
        flex: '0 0 auto',
        alignItems: 'center',
        height: '30px',
        width: '100%',
        position: 'relative',
        background: 'var(--color-dark)'
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
        {openFiles.map(file => (
          <FileTab
            key={file.name}
            file={file}
            open={currentFile && file.name === currentFile.name}
            onOpen={() => openFile(file.name)}
            onClose={() => closeFile(file.name)}
          />
        ))}
      </header>
    </section>
  );
};

export default EditorTopBar;

/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';

import { File } from '../../overmind/rootState';

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
        cursor: 'pointer',
        height: '100%'
      }}
      style={
        open
          ? { color: 'var(--color-text)', background: 'var(--color-darkest)' }
          : undefined
      }
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
    actions: {
      Editor: { openFile, closeFile }
    },
    state: {
      Editor: { activeFile, openTabs, files }
    }
  } = useOvermind();

  return (
    openTabs &&
    openTabs.length > 0 && (
      <section
        css={{
          display: 'flex',
          flexDirection: 'row',
          flex: '0 0 auto',
          alignItems: 'center',
          height: '30px',
          width: '100%',
          position: 'relative',
          color: 'var(--color-text-muted)',
          background: 'var(--color-dark)',
          fontSize: '0.9em'
        }}
      >
        {openTabs
          .map(tab => files[tab])
          .map(file => (
            <FileTab
              key={file.name}
              file={file}
              open={activeFile && file.name === activeFile.name}
              onOpen={() => openFile(file.name)}
              onClose={() => closeFile(file.name)}
            />
          ))}
      </section>
    )
  );
};

export default EditorTopBar;

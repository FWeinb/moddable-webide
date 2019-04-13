/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';
import { XFile } from '../../overmind/Storage/state';
import { EditorFile } from '../../overmind/Editor/state';
import { getPath } from '../../overmind/Storage/utils';

const FileTab: React.FunctionComponent<{
  tab: EditorFile;
  file: XFile;
  path: string;
  open: boolean;
  onOpen: VoidFunction;
  onClose: VoidFunction;
}> = ({ tab, file, path, open, onOpen, onClose }) => {
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
        {file ? path + (tab.dirty ? '*' : '') : ''}
      </div>
      <div onClick={() => onClose()}>×</div>
    </div>
  );
};

const EditorTopBar: React.FunctionComponent = () => {
  const {
    state: {
      Editor: { activeFile, openTabs },
      Storage
    },
    actions: {
      Editor: { openFile, closeFile }
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
        {openTabs.map(tab => (
          <FileTab
            key={tab.id}
            tab={tab}
            file={Storage.files[tab.id]}
            path={getPath(Storage, tab.id)}
            open={activeFile && tab.id === activeFile.id}
            onOpen={() => openFile(tab.id)}
            onClose={() => closeFile(tab.id)}
          />
        ))}
      </section>
    )
  );
};

export default EditorTopBar;

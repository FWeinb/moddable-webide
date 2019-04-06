/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import FileTree from '../FileTree';
import { useOvermind } from '../../overmind';

const FileExplorer: React.FunctionComponent = () => {
  const {
    state: {
      device: { instruments }
    }
  } = useOvermind();

  return (
    <section
      role="Explorer"
      css={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-dark)',
        height: '100%'
      }}
    >
      <section css={{ margin: '0.5em 0', fontSize: '0.9rem' }}>
        <header
          css={{
            padding: '0 10px',
            textTransform: 'uppercase',
            color: '#6e7a82',
            paddingBottom: '0.25rem'
          }}
        >
          Files
        </header>
        <FileTree />
      </section>
    </section>
  );
};

export default FileExplorer;

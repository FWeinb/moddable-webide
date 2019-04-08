/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import FileTree from '../FileTree';
import { useOvermind } from '../../overmind';
import SplitPane from 'react-split-pane';

const FileExplorer: React.FunctionComponent = () => {
  const {
    state: {
      Device: {
        debug: { instruments }
      }
    }
  } = useOvermind();

  return (
    <section
      role="complementary"
      css={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-dark)',
        height: '100%'
      }}
    >
      <section css={{ fontSize: '0.9rem' }}>
        <header
          css={{
            display: 'flex',
            alignItems: 'center',
            height: 30,
            fontSize: '0.8em',
            padding: '0 10px',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)'
          }}
        >
          Explorer
        </header>
        <FileTree />
      </section>
    </section>
  );
};

export default FileExplorer;

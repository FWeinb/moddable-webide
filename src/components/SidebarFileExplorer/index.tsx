/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import React from 'react';
import FileTree from '../FileTree';

const FileExplorer: React.FunctionComponent = () => {
  return (
    <section
      role="complementary"
      css={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-dark)',
        height: '100%',
        fontSize: '0.9rem'
      }}
    >
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
  );
};

export default FileExplorer;

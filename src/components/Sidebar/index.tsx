/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import FileTree from '../FileTree';
import GistIcon from './GistIcon';
import { useOvermind } from '../../overmind';

const Sidebar: React.FunctionComponent = () => {
  const {
    actions: { openGist }
  } = useOvermind();
  return (
    <section
      role="Sidebar"
      css={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-sidebar-background)',
        height: '100%'
      }}
    >
      <header
        css={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          position: 'relative',
          flex: '0 0 auto',
          height: '40px',
          padding: '0 10px',
          width: '100%',
          color: '#fff',
          ':after': {
            content: "''",
            position: 'absolute',
            bottom: '0',
            left: '10px',
            right: '10px',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }
        }}
      >
        <div>XS WebIDE</div>
        <div
          css={{
            margin: '0 0 0 auto'
          }}
        >
          <button
            onClick={() => openGist()}
            title="Open GitHub Gist"
            css={{
              webkitAppearance: 'none',
              all: 'unset',
              cursor: 'pointer',
              margin: '0 0.5em'
            }}
          >
            <GistIcon />
          </button>
        </div>
      </header>
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

export default Sidebar;

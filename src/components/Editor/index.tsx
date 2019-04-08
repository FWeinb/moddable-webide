/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import EditorTabs from './EditorTabs';
import EditorMonaco from './EditorMonaco';

import { useOvermind } from '../../overmind';

const Editor: React.FunctionComponent = () => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%'
      }}
    >
      <EditorTabs />
      <EditorMonaco />
    </div>
  );
};

export default Editor;

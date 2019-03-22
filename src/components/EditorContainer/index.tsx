/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import EditorTopBar from '../EditorTopBar';
import Editor from '../Editor';
import { useOvermind } from '../../overmind';

const EditorContainer: React.FunctionComponent = () => {
  const {
    state: {
      editor: { currentFileName }
    }
  } = useOvermind();
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#1e1e1e'
      }}
    >
      <EditorTopBar />
      <Editor />
    </div>
  );
};

export default EditorContainer;

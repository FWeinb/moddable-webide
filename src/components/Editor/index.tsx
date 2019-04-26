/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import ImageViewer from '../ImageViewer';
import EditorTabs from './EditorTabs';
import EditorMonaco from './EditorMonaco';

import { useOvermind } from '../../overmind';

const Editor: React.FunctionComponent = () => {
  const {
    state: {
      Editor: { activeFile },
      Storage: { files }
    }
  } = useOvermind();

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
      {activeFile && files[activeFile.id] && files[activeFile.id].binary ? (
        <ImageViewer file={files[activeFile.id]} />
      ) : (
        <EditorMonaco />
      )}
    </div>
  );
};

export default Editor;

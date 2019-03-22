/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';

import { useOvermind } from '../../overmind';
import { File } from '../../overmind/state';

type FileItemProp = {
  selected: boolean;
  file: File;
};

const FileItem: React.FunctionComponent<FileItemProp> = ({
  file,
  selected
}) => {
  const {
    actions: { openFile }
  } = useOvermind();

  return (
    <li
      onClick={() => openFile(file.name)}
      css={{
        color: '#9ea4a7',
        cursor: 'pointer',
        padding: '0 15px'
      }}
      style={
        selected
          ? {
              color: 'white',
              background: '#3f3f46'
            }
          : undefined
      }
    >
      {file.name}
    </li>
  );
};

const FileTree: React.FunctionComponent = () => {
  const {
    state: {
      editor: { currentFileName, files }
    }
  } = useOvermind();

  return (
    <ul
      css={{
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}
    >
      {files &&
        Object.values(files).map(file => {
          return (
            <FileItem
              key={file.name}
              file={file}
              selected={currentFileName === file.name}
            />
          );
        })}
    </ul>
  );
};

export default FileTree;

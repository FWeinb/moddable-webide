/** @jsx jsx */
import { jsx } from '@emotion/core';

import React, { useState } from 'react';

import { useOvermind } from '../../overmind';
import { File } from '../../overmind/rootState';
import Button from '../Button';
import NewFileIcon from '../Icons/NewFileIcon';

type FileItemProp = {
  selected: boolean;
  file: File;
};

const FileItem: React.FunctionComponent<FileItemProp> = ({
  file,
  selected
}) => {
  const {
    actions: {
      Editor: { removeFile, openFile }
    }
  } = useOvermind();

  const [hover, setHover] = useState(false);

  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => openFile(file.name)}
      css={{
        display: 'flex',
        cursor: 'pointer',
        paddingLeft: '1.25em',
        color: 'var(--color-text-muted)'
      }}
      style={
        selected
          ? {
              color: 'var(--color-text)',
              background: 'var(--color-light)'
            }
          : undefined
      }
    >
      <span>{file.name}</span>
      <section
        css={{ marginLeft: 'auto', fontWeight: 'bold' }}
        style={{ visibility: hover ? 'visible' : 'hidden' }}
      >
        <Button
          onClick={() => removeFile(file.name)}
          css={{ transform: 'scale(1.2)', color: 'var(--color-text)' }}
        >
          ×
        </Button>
      </section>
    </li>
  );
};

const FileTree: React.FunctionComponent = () => {
  const {
    state: {
      Editor: { activeFile, files }
    },
    actions: {
      Editor: { addFile }
    }
  } = useOvermind();

  const [hover, setHover] = useState(false);

  return (
    <section css={{ width: '100%' }}>
      <header
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        css={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          paddingLeft: '1em',
          textTransform: 'uppercase',
          fontSize: 11,
          height: 22,
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          background: 'var(--color-light2)'
        }}
      >
        <span>Files</span>
        <Button
          onClick={() => addFile()}
          css={{
            padding: 0,
            marginLeft: 'auto',
            fontWeight: 'bold',
            color: '#fff'
          }}
          style={{ visibility: hover ? 'visible' : 'hidden' }}
        >
          <NewFileIcon />
        </Button>
      </header>
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
                selected={activeFile && activeFile.name === file.name}
              />
            );
          })}
      </ul>
    </section>
  );
};

export default FileTree;

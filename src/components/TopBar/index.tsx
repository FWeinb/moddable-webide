/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';

import GistIcon from '../Icons/GistIcon';
import FlashIcon from '../Icons/FlashIcon';
import WebIDELogo from '../Icons/WebIDELogo';
import Input from '../Input';
import Button from '../Button';

import { useOvermind } from '../../overmind';
import { CompilerState } from '../../overmind/Compiler/state';

const EditorTopBar: React.FunctionComponent = () => {
  const {
    actions: {
      openGist,
      Device: { setDeviceHostName },
      Compiler: { compileAndUpload }
    },
    state: {
      Device: { host },
      Compiler: { state }
    }
  } = useOvermind();

  const compilerNotReady = state !== CompilerState.READY;

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        paddingLeft: '10px'
      }}
    >
      <WebIDELogo height="80%" />
      <div
        css={{
          display: 'flex',
          height: '100%',
          marginLeft: 'auto',
          alignItems: 'center',
          background: '#2a2a2b'
        }}
      >
        <Button onClick={() => openGist()} title="Open GitHub Gist">
          <GistIcon />
        </Button>
        <Input
          onChange={e => setDeviceHostName(e.target.value)}
          type="text"
          value={host}
          placeholder="Hostname/IP"
        />
        <Button
          onClick={compileAndUpload}
          disabled={compilerNotReady}
          title="Flash"
        >
          <FlashIcon />
        </Button>
      </div>
    </div>
  );
};

export default EditorTopBar;

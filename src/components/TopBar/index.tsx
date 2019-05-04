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
import { ConnectionState } from '../../overmind/Device/state';

const EditorTopBar: React.FunctionComponent = () => {
  const {
    actions: {
      Device: { setDeviceHostName },
      Compiler: { compileAndUpload },
      askImportGist
    },
    state: {
      Device: { connectionState, host },
      Compiler: { state }
    }
  } = useOvermind();

  const compilerNotReady = state !== CompilerState.READY;
  let connectionColor = undefined;
  switch (connectionState) {
    case ConnectionState.DISCONNECTED:
      connectionColor = 'rgba(255,255,255,0.3)';
      break;
    case ConnectionState.CONNECTED:
      connectionColor = '#3ebf44';
      break;
    case ConnectionState.CONNECTING:
      connectionColor = '#037acc';
      break;
    case ConnectionState.ERROR:
      connectionColor = 'red';
      break;
  }

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        paddingLeft: '10px'
      }}
    >
      <WebIDELogo height="30" />
      <div
        css={{
          display: 'flex',
          height: '100%',
          marginLeft: 'auto',
          alignItems: 'center',
          background: '#2a2a2b'
        }}
      >
        <Button
          onClick={() => askImportGist()}
          title="Add files from GitHub Gist"
        >
          <GistIcon />
        </Button>
        <span
          title="Connection State"
          css={{ marginRight: '7px' }}
          style={{ color: connectionColor }}
        >
          ●
        </span>
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

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
import {
  ConnectionState,
  DebugState,
  ConnectionType
} from '../../overmind/Device/state';

const UsbSettings: React.FC = () => {
  const {
    actions: {
      Device: { setBaudRate }
    },
    state: {
      Device: { baudRate }
    }
  } = useOvermind();
  return (
    <select
      onChange={e => setBaudRate(parseInt(e.target.value, 10))}
      className={'monaco-select-box'}
      css={{
        marginRight: '.5em'
      }}
    >
      <option value="921600">ESP8266 (921,600)</option>
      <option value="460800">ESP32 (460,800)</option>
    </select>
  );
};

const WifiSettings: React.FC = () => {
  const {
    actions: {
      Device: { setHostName }
    },
    state: {
      Device: { host }
    }
  } = useOvermind();
  return (
    <Input
      onChange={e => setHostName(e.target.value)}
      type="text"
      value={host}
      placeholder="Hostname/IP"
      css={{
        height: '2.5em',
        padding: '0 5px',
        marginRight: '.5em'
      }}
    />
  );
};
const renderSettingsForConnectionType = (type: ConnectionType) => {
  switch (type) {
    case ConnectionType.USB:
      return <UsbSettings />;
    case ConnectionType.WIFI:
      return <WifiSettings />;
    default:
      return <div>Unkown Settings</div>;
  }
};

const TopBar: React.FC = () => {
  const {
    actions: {
      Device: { setConnectionType, connectDebugger },
      Compiler: { compileAndUpload },
      askImportGist
    },
    state: {
      Device: {
        connectionType,
        connectionState,
        debug: { state: debugState }
      },
      Compiler: { state }
    }
  } = useOvermind();

  const compilerNotReady = state !== CompilerState.READY;
  let connectionColor = null;
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
        <select
          onChange={e =>
            setConnectionType(e.currentTarget.value as ConnectionType)
          }
          value={connectionType}
          css={{ marginRight: '.5em' }}
        >
          <option value="USB">USB</option>
          <option value="WIFI">WiFi</option>
        </select>
        {renderSettingsForConnectionType(connectionType)}
        <span title="Connection State" style={{ color: connectionColor }}>
          ●
        </span>
        <Button
          onClick={compileAndUpload}
          disabled={compilerNotReady}
          title="Flash"
        >
          <FlashIcon />
        </Button>
        <Button
          disabled={debugState === DebugState.CONNECTED}
          onClick={() => connectDebugger()}
          title="Connect Debugger"
        >
          <span
            css={{
              color: 'white',
              filter: 'grayscale(100%) brightness(10000%)'
            }}
          >
            🐞
          </span>
        </Button>
      </div>
    </div>
  );
};

export default TopBar;

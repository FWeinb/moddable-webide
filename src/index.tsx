/** @jsx jsx */
import { jsx } from '@emotion/core';

import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom';

import SidebarViewContainer from './components/SidebarViewContainer';

import Layout from './components/Layout';
import Log from './components/Log';
import Editor from './components/Editor';
import TopBar from './components/TopBar';
import ActivityBar from './components/ActivityBar';

const App: React.FunctionComponent = () => {
  return (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: '50px auto',
        gridTemplateRows: '40px auto',
        height: '100vh'
      }}
    >
      <div
        css={{
          gridRow: 1,
          gridColumn: '1 / 3',
          background: 'var(--color-lightest)'
        }}
      >
        <TopBar />
      </div>
      <div
        css={{
          gridRow: 2,
          gridColumn: 1
        }}
      >
        <ActivityBar />
      </div>
      <div
        css={{
          gridRow: 2,
          gridColumn: 2,
          height: 'calc(100vh - 40px)'
        }}
      >
        <Layout
          content={<Editor />}
          sidebar={<SidebarViewContainer />}
          log={<Log />}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
/*
import DebugFrames from './components/SidebarDebug/DebugFrames';
import DeviceConnection, { XsbugLocalMessage } from './xs/DeviceConnection';

const DebugDemo = () => {
  const [localFrame, setLocalFrame] = React.useState();
  const connection = React.useRef<DeviceConnection>();
  const toggle = React.useCallback(
    value => connection.current.doToggle(value),
    [connection]
  );
  useEffect(() => {
    connection.current = new DeviceConnection(`ws://runmod.local:8080`);
    connection.current.onLogin = () => {
      console.log('Ready');
      connection.current.doGo();
      setTimeout(() => {
        connection.current.doStep();
      }, 500);
    };
    connection.current.onLocal = value => {
      console.log(value);
      setLocalFrame(value);
    };
    connection.current.connect();
  }, []);

  return localFrame ? (
    <DebugFrames frames={localFrame} toggle={toggle} />
  ) : (
    <div />
  );
};

ReactDOM.render(<DebugDemo />, document.getElementById('root'));
*/

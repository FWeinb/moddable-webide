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

import { DndProvider } from 'react-dnd';
import HTML5Backend from './utils/HTML5DirectoryBackend';

import { overmind } from './overmind';
import { Provider as OvermindProvider } from 'overmind-react';

const App: React.FunctionComponent = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <OvermindProvider value={overmind}>
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
      </OvermindProvider>
    </DndProvider>
  );
};
ReactDOM.render(<App />, document.getElementById('root'));

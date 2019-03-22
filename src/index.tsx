/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import ReactDOM from 'react-dom';

import { Global, css } from '@emotion/core';

import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import EditorContainer from './components/EditorContainer';
import Log from './components/Log';

const App: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <Global
        styles={css`
          * {
            box-sizing: border-box;
          }
          html,
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Helvetica, Arial, sans-serif, 'Apple Color Emoji',
              'Segoe UI Emoji', 'Segoe UI Symbol';
            margin: 0;
            padding: 0;
            background: var(--color-background);
            overflow: hidden;
            color: white;
          }

          :root {
            --color-sidebar-background: #252526;
            --color-background: #1e1e1e;
          }
        `}
      />
      <Layout
        sidebar={() => <Sidebar />}
        content={() => <EditorContainer />}
        log={() => <Log />}
      />
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

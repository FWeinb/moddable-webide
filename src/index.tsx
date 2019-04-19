/** @jsx jsx */
import { jsx } from '@emotion/core';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

import { Global, css } from '@emotion/core';

import SidebarViewContainer from './components/SidebarViewContainer';

import Layout from './components/Layout';
import Log from './components/Log';
import Editor from './components/Editor';
import TopBar from './components/TopBar';
import ActivityBar from './components/ActivityBar';

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
            background: var(--color-darkest);
            overflow: hidden;
            color: white;
          }

          html,
          body,
          #root  {
            height: 100%;
            width: 100%;
          }

          :root {
            --color-lightest: #3b3b3b;
            --color-light2: #383839;
            --color-light: #2d2d2d;
            --color-dark: #252526;
            --color-darkest: #1e1e1e;

            --color-accent: #175a89;
            --color-text: #fff;
            --color-text-muted: rgba(255, 255, 255, 0.5);

            --color-error: #e51402;
            --color-warning: #fee226;
          }
          .scrolling::-webkit-scrollbar {
            width: 13px;
            height: 0;
          }

          .scrolling::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.15);
            outline: none;
          }
        `}
      />
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: '50px auto',
          gridTemplateRows: '40px auto',
          justifyItems: 'stretch',
          alignItems: 'stretch',
          height: '100%'
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
            position: 'relative',
            gridRow: 2,
            gridColumn: 1,
            height: 'calc(100vh - 40px)'
          }}
        >
          <ActivityBar />
        </div>
        <div
          css={{
            position: 'relative',
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
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

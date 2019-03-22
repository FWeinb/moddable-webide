/** @jsx jsx */
import { jsx } from '@emotion/core';

import './styles.css';

import React, { useRef } from 'react';
import SplitPane from 'react-split-pane';

type Props = {
  sidebar: () => React.ReactNode;
  content: () => React.ReactNode;
  log: () => React.ReactNode;
};

const Layout: React.FunctionComponent<Props> = ({
  sidebar,
  content,
  log,
  ...reset
}) => {
  return (
    <SplitPane {...reset} split="vertical" minSize={150} defaultSize={200}>
      <React.Fragment>{sidebar && sidebar()}</React.Fragment>
      <SplitPane
        split="horizontal"
        pane2Style={{
          overflow: 'auto',
          background: 'var(--color-background)'
        }}
        defaultSize="85%"
      >
        <React.Fragment>{content && content()}</React.Fragment>
        <React.Fragment>{log && log()}</React.Fragment>
      </SplitPane>
    </SplitPane>
  );
};

export default Layout;

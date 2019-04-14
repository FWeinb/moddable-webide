/** @jsx jsx */
import { jsx } from '@emotion/core';

import './styles.css';

import React, { useState, useEffect } from 'react';
import SplitPane from 'react-split-pane';

import { useOvermind } from '../../overmind';
import { SidebarView } from '../../overmind/rootState';

const createuseLocalState = key => {
  return initialState => {
    const [state, setState] = useState(() => {
      const item = localStorage.getItem(key);
      try {
        return JSON.parse(item);
      } catch (e) {
        return initialState;
      }
    });
    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [state]);

    return [state, setState];
  };
};
const useSidebarSize = createuseLocalState('sidebarSize');
const useEditorSize = createuseLocalState('editorSize');

type Props = {
  sidebar: React.ReactElement;
  content: React.ReactElement;
  log: React.ReactElement;
};

const Layout: React.FunctionComponent<Props> = ({
  sidebar,
  content,
  log,
  ...reset
}) => {
  const {
    state: { selectedSidebarView }
  } = useOvermind();

  const [sidebarSize, setSidebarSize] = useSidebarSize(200);
  const [editorSize, setEditorSize] = useEditorSize('85%');

  return (
    <SplitPane
      {...reset}
      style={{ position: 'relative' }}
      pane1Style={
        selectedSidebarView === SidebarView.Hidden
          ? {
              visibility: 'hidden',
              maxWidth: 0
            }
          : {}
      }
      split="vertical"
      size={sidebarSize}
      minSize={0}
      onDragStarted={() => {
        document.body.style.cursor = 'col-resize';
      }}
      onDragFinished={size => {
        document.body.style.cursor = '';
        setSidebarSize(size);
      }}
    >
      {sidebar}
      <SplitPane
        split="horizontal"
        pane1Style={{
          maxHeight: 'calc(100% - 35px)'
        }}
        pane2Style={{
          overflow: 'hidden',
          background: 'var(--color-background)'
        }}
        defaultSize={editorSize}
        onDragStarted={() => {
          document.body.style.cursor = 'row-resize';
        }}
        onDragFinished={size => {
          document.body.style.cursor = '';
          setEditorSize(size);
        }}
      >
        {content}
        {log}
      </SplitPane>
    </SplitPane>
  );
};

export default Layout;

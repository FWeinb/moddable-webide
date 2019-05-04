/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import FileIcon from '../Icons/FileIcon';
import DebugIcon from '../Icons/DebugIcon';

import ActivityBarButton from './ActivityBarButton';

import { useOvermind } from '../../overmind';
import { SidebarView } from '../../overmind/rootState';
import { DebugState } from '../../overmind/Device/state';

const FileExplorerButton: React.FC = () => {
  const {
    state: { selectedSidebarView },
    actions: { setActiveSidebarView }
  } = useOvermind();

  return (
    <ActivityBarButton
      selected={selectedSidebarView === SidebarView.FileExplorer}
      onClick={() => {
        setActiveSidebarView(SidebarView.FileExplorer);
      }}
    >
      <FileIcon />
    </ActivityBarButton>
  );
};

const DebugButton: React.FC = () => {
  const {
    state: { selectedSidebarView, Device: DeviceState },
    actions: { setActiveSidebarView }
  } = useOvermind();

  let debugIndicatorColor = undefined;
  switch (DeviceState.debug.state) {
    case DebugState.CONNECTED:
      debugIndicatorColor = '#3ebf44';
      break;
    case DebugState.CONNECTING:
      debugIndicatorColor = '#037acc';
      break;
  }

  return (
    <ActivityBarButton
      disabled={DeviceState.debug.state !== DebugState.CONNECTED}
      selected={selectedSidebarView === SidebarView.Debug}
      onClick={() => setActiveSidebarView(SidebarView.Debug)}
    >
      <DebugIcon indicatorColor={debugIndicatorColor} />
    </ActivityBarButton>
  );
};

const ActivityBar: React.FunctionComponent = () => {
  return (
    <div
      css={{
        display: 'flex',
        alignContent: 'center',
        flexDirection: 'column',
        background: 'var(--color-light)',
        width: 50,
        height: '100%',
        paddingTop: '10px'
      }}
    >
      <FileExplorerButton />
      <DebugButton />
    </div>
  );
};

export default ActivityBar;

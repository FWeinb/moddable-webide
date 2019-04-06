/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import FileIcon from '../Icons/FileIcon';
import DebugIcon from '../Icons/DebugIcon';

import ActivityBarButton from './ActivityBarButton';

import { useOvermind } from '../../overmind';
import {
  SidebarView,
  DeviceInstrumentConnectionState
} from '../../overmind/state';

const FileExplorerButton: React.FC = () => {
  const {
    state: {
      ide: { selectedSidebarView }
    },
    actions: { setActiveSidebarView }
  } = useOvermind();

  return (
    <ActivityBarButton
      selected={selectedSidebarView === SidebarView.FileExplorer}
      onClick={() => setActiveSidebarView(SidebarView.FileExplorer)}
    >
      <FileIcon />
    </ActivityBarButton>
  );
};

const DebugButton: React.FC = () => {
  const {
    state: {
      ide: { selectedSidebarView },
      device: { debugConnectionState }
    },
    actions: { setActiveSidebarView }
  } = useOvermind();

  let debugIndicatorColor = undefined;
  switch (debugConnectionState) {
    case DeviceInstrumentConnectionState.CONNECTED:
      debugIndicatorColor = '#3ebf44';
      break;
    case DeviceInstrumentConnectionState.CONNECTING:
      debugIndicatorColor = '#037acc';
      break;
    case DeviceInstrumentConnectionState.ERROR:
      debugIndicatorColor = 'red';
      break;
  }

  return (
    <ActivityBarButton
      disabled={
        debugConnectionState !== DeviceInstrumentConnectionState.CONNECTED
      }
      selected={selectedSidebarView === SidebarView.Debug}
      onClick={() => setActiveSidebarView(SidebarView.Debug)}
    >
      <DebugIcon indicatorColor={debugIndicatorColor} />
    </ActivityBarButton>
  );
};

const ActivityBar: React.FunctionComponent = () => {
  const {
    state: {
      ide: { selectedSidebarView },
      device: { debugConnectionState }
    },
    actions: { setActiveSidebarView }
  } = useOvermind();

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

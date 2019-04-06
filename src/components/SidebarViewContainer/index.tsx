/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';
import { SidebarView } from '../../overmind/state';

import SidebarFileExplorer from '../SidebarFileExplorer';
import SidebarDebug from '../SidebarDebug';

const SidebarViewContainer: React.FunctionComponent = () => {
  const {
    state: {
      ide: { selectedSidebarView }
    }
  } = useOvermind();

  switch (selectedSidebarView) {
    case SidebarView.FileExplorer:
      return <SidebarFileExplorer />;
    case SidebarView.Debug:
      return <SidebarDebug />;
  }

  return null;
};

export default SidebarViewContainer;

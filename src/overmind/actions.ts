import { Action } from 'overmind';
import { files as sampleFiles } from './defaultFiles';
import { SidebarView } from './rootState';

export const loadSampleData: Action = ({ state, actions }) => {
  actions.Editor.loadFiles(JSON.parse(JSON.stringify(sampleFiles)));
};

export const loadGist: Action<string> = async (
  { actions, effects },
  gistId
) => {
  actions.Editor.loadFiles(await effects.loadGist(gistId));
};

export const openGist: Action = ({ actions }) => {
  const gistId = window.prompt('Input GistId:');
  if (gistId) {
    actions.loadGist(gistId);
  }
};

export const setActiveSidebarView: Action<SidebarView> = (
  { state },
  newActiveSidebar
) => {
  if (state.selectedSidebarView === newActiveSidebar) {
    state.selectedSidebarView = SidebarView.Hidden;
  } else {
    state.selectedSidebarView = newActiveSidebar;
  }
};

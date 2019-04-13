import { Action } from 'overmind';
import { SidebarView } from './rootState';

export const importGist: Action<string> = async (
  { actions, effects },
  gistId
) => {
  actions.Storage.addFiles(await effects.loadGist(gistId));
};

export const askImportGist: Action = ({ actions }) => {
  const gistId = window.prompt('Input GistId:');
  if (gistId) {
    actions.importGist(gistId);
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

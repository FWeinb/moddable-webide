import { Action } from 'overmind';
import { SidebarView } from './rootState';

export const askNewProject: Action = async ({ actions, effects }) => {
  const projectName = window.prompt('Input Project Name:', 'NewProject');
  if (projectName) {
    if (await effects.Storage.hasProject(projectName)) {
      const confirmed = window.confirm(
        `There is a project with name "${projectName}". Do you want to overwrite it?`
      );
      if (!confirmed) {
        return;
      }
    }
    actions.Editor.saveAllFiles();
    actions.Storage.openProject(projectName);

    // TODO: Don't use sample data here...
    // Just have a mod.js file instead
    await actions.Storage.loadSampleData(
      `// This is your new project "${projectName}"`
    );
  }
};

export const askRemoveProject: Action<string> = ({ actions }, projectName) => {
  const confirmed = window.confirm(
    `Are you sure you want to remove the project "${projectName}"?`
  );
  if (confirmed) {
    actions.Storage.removeProject(projectName);
  }
};

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

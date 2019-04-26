import { OnInitialize } from 'overmind';

export const onInitialize: OnInitialize = async ({
  state,
  effects,
  actions
}) => {
  actions.Compiler.load();
  const urlParams = new URLSearchParams(window.location.search);
  const projectName = urlParams.get('project');
  if (await effects.Storage.hasProject(projectName)) {
    actions.Storage.openProject(projectName);
  }
};

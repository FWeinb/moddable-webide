export enum SidebarView {
  Hidden,
  FileExplorer,
  Debug
}

export type State = {
  selectedSidebarView: SidebarView;
};

const state: State = {
  selectedSidebarView: SidebarView.FileExplorer
};

export default state;

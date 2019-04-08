import XsbugConnection from '../xs/XsbugConnection';

export type File = {
  name: string;
  content: string;
  dirty: boolean;
  open: boolean;
};

export type FileMap = {
  [path: string]: File;
};

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

import { string } from 'prop-types';

export type INode = {
  id: string;
  name: string;
  parent?: string;
};
export type Directory = INode;

export type XFile = INode & {
  content: string;
};

// Naming this storage is clashing with
// WebStorage API
export type XStorage = {
  project: string;
  directories: {
    [id: string]: Directory;
  };
  files: {
    [id: string]: XFile;
  };
};

const state: XStorage = {
  project: null,
  directories: {},
  files: {}
};

export default state;

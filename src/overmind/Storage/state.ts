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
  directories: {
    [id: string]: Directory;
  };
  files: {
    [id: string]: XFile;
  };
};

const state: XStorage = {
  directories: {},
  files: {}
};

export default state;

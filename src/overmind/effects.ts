import { FileMap } from './rootState';

export const loadGist = async (gistId: string): Promise<FileMap> => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`);
  const data = await response.json();

  return Object.values(data.files).reduce((acc, file: any) => {
    acc[file.filename] = {
      name: file.filename,
      content: file.content,
      dirty: false
    };
    return acc;
  }, {}) as FileMap;
};

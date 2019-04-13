import { XStorage } from './Storage/state';
import { generateNodeId } from './Storage/utils';

export const loadGist = async (gistId: string): Promise<XStorage> => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`);
  const data = await response.json();

  return Object.values(data.files).reduce(
    (acc: XStorage, file: any) => {
      const id = generateNodeId();
      acc.files[id] = {
        id,
        name: file.filename,
        content: file.content
      };
      return acc;
    },
    {
      files: {},
      directories: {}
    }
  );
};

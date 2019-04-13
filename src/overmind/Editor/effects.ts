import monaco from '../../components/Editor/monaco';
import { XFile, XStorage } from '../Storage/state';
import { getPath } from '../Storage/utils';

const openModels: monaco.editor.ITextModel[] = [];

export const createModel = (
  storage: XStorage,
  file: XFile
): monaco.editor.ITextModel => {
  let model = openModels.find(m => m.uri.path === file.id);
  if (model) {
    return model;
  }
  model = monaco.editor.createModel(
    file.content,
    'javascript',
    monaco.Uri.parse('mem://' + file.id)
  );
  openModels.push(model);
  return model;
};

export const getOpenModels = (): { id: string; content: string }[] => {
  return openModels.map(m => ({
    id: m.uri.authority,
    content: m.getValue()
  }));
};

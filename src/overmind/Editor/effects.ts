import monaco from '../../components/Editor/monaco';
import { XFile, XStorage } from '../Storage/state';
import { getPath, getIdByPath } from '../Storage/utils';

export const getModel = (
  storage: XStorage,
  file: XFile
): monaco.editor.ITextModel => {
  const path = getPath(storage, file.id);
  let model = monaco.editor
    .getModels()
    .find(model => model.uri.path.substring(1) === path);
  if (model) {
    return model;
  }

  model = monaco.editor.createModel(
    file.content,
    'javascript',
    monaco.Uri.parse('mem:///' + path)
  );
  return model;
};

export const getOpenModels = (
  Storage: XStorage
): { id: string; content: string }[] => {
  return monaco.editor.getModels().map(m => ({
    id: getIdByPath(Storage, m.uri.path),
    content: m.getValue()
  }));
};

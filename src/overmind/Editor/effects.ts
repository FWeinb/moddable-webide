import monaco from '../../components/Editor/monaco';
import { XFile, XStorage } from '../Storage/state';
import { getPath, getIdByPath } from '../Storage/utils';

const getLanguage = (name: string) => {
  if (name.endsWith('.js')) {
    return 'javascript';
  } else if (name.endsWith('.json')) {
    return 'json';
  }
};

export const getModel = (
  storage: XStorage,
  file: XFile
): monaco.editor.ITextModel => {
  if (file.binary) return;

  const path = getPath(storage, file.id);
  let model = monaco.editor
    .getModels()
    .find(model => model.uri.path.substring(1) === path);
  if (model) {
    return model;
  }

  model = monaco.editor.createModel(
    file.content as string,
    getLanguage(file.name),
    monaco.Uri.parse('mem:///' + path)
  );
  return model;
};

export const disposeAllModels = () => {
  return monaco.editor.getModels().forEach(model => model.dispose());
};

export const getOpenModels = (
  Storage: XStorage
): { id: string; content: string }[] => {
  return monaco.editor.getModels().map(m => ({
    id: getIdByPath(Storage, m.uri.path),
    content: m.getValue()
  }));
};

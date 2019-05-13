import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { StandaloneCodeEditorServiceImpl } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeServiceImpl';
import { SimpleEditorModelResolverService } from 'monaco-editor/esm/vs/editor/standalone/browser/simpleServices';
import { overmind } from '../../overmind';

declare global {
  interface Window {
    MonacoEnvironment: any;
  }
}

self.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js';
    }
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  }
};
SimpleEditorModelResolverService.prototype.findModel = StandaloneCodeEditorServiceImpl.prototype.findModel = function(
  editor,
  resource
) {
  return monaco.editor
    .getModels()
    .find(model => model.uri.toString() === resource.toString());
};

StandaloneCodeEditorServiceImpl.prototype.openCodeEditor = async (
  input,
  source,
  sideBySide
) => {
  overmind.actions.Editor.openFileByResourceInput(input);
};

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  allowComments: true
});

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2018,
  allowNonTsExtensions: true,
  noEmit: true
});
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.addExtraLib(
  `
  /**
   * Build-in function 
   */
  declare function trace(message: any): void;
`,
  'globals'
);

export default monaco;

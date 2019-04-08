import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js';
import 'monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations.js';
import 'monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js';
import 'monaco-editor/esm/vs/editor/contrib/codeAction/codeActionContributions.js';
import 'monaco-editor/esm/vs/editor/contrib/comment/comment.js';
import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import 'monaco-editor/esm/vs/editor/contrib/folding/folding.js';
import 'monaco-editor/esm/vs/editor/contrib/fontZoom/fontZoom.js';
import 'monaco-editor/esm/vs/editor/contrib/goToDefinition/goToDefinitionCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/goToDefinition/goToDefinitionMouse.js';
import 'monaco-editor/esm/vs/editor/contrib/hover/hover.js';
import 'monaco-editor/esm/vs/editor/contrib/inPlaceReplace/inPlaceReplace.js';
import 'monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations.js';
import 'monaco-editor/esm/vs/editor/contrib/fontZoom/fontZoom.js';
import 'monaco-editor/esm/vs/editor/contrib/multicursor/multicursor.js';
import 'monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js';
import 'monaco-editor/esm/vs/editor/contrib/referenceSearch/referenceSearch.js';
import 'monaco-editor/esm/vs/editor/contrib/rename/rename.js';
import 'monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect.js';
import 'monaco-editor/esm/vs/editor/contrib/snippet/snippetController2.js';
import 'monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js';
import 'monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode.js';
import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter.js';
import 'monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js';
import 'monaco-editor/esm/vs/editor/contrib/wordPartOperations/wordPartOperations.js';

import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';

import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

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
    return './editor.worker.bundle.js';
  }
};

monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2015,
  lib: ['es6']
});

export default monaco;

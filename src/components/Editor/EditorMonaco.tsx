/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useRef, useEffect, useState } from 'react';

import { disableBodyScroll } from 'body-scroll-lock';

import './style.css';

import monaco from './monaco';
import ESLint from '../../eslint/index';

import WelcomeScreen from '../WelcomeScreen';
import { useOvermind } from '../../overmind';

type EditorState = {
  [name: string]: {
    version?: number;
    viewState?: any;
  };
};

const Editor: React.FC = () => {
  const {
    state: {
      Editor: { openSelection, activeFile, breakpoints },
      Storage
    },
    actions: {
      Editor: { updateEditorFile, addBreakpoint }
    },
    effects: {
      Editor: { getModel }
    }
  } = useOvermind();

  const [eslint, _] = useState<ESLint>(() => new ESLint());
  const editorStats = useRef<EditorState>({});
  const editorContainer = useRef(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>(null);

  const runEslint = model => {
    if (
      Storage.files[activeFile.id] &&
      Storage.files[activeFile.id].name.endsWith('.js')
    ) {
      eslint
        .verify(model.getValue(), {
          parserOptions: {
            ecmaVersion: 6,
            sourceType: 'module'
          }
        })
        .then(markers => {
          monaco.editor.setModelMarkers(model, 'eslint', markers);
        });
    }
  };

  // Create Editor
  useEffect(() => {
    editor.current = monaco.editor.create(editorContainer.current, {
      minimap: {
        enabled: false
      },
      theme: 'vs-dark',
      automaticLayout: true
    });

    disableBodyScroll(editor.current);

    return () => {
      editor.current.dispose();
    };
  }, [editorContainer]);

  // Add Save Shortcut + add breakpoints
  useEffect(() => {
    if (!activeFile) return;

    editor.current.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
      () => {
        const currentModel = editor.current.getModel();

        editorStats.current[
          activeFile.id
        ].version = currentModel.getAlternativeVersionId();

        updateEditorFile({
          id: activeFile.id,
          content: currentModel.getValue(),
          dirty: false
        });
      }
    );

    const mouseDown = editor.current.onMouseDown(e => {
      e.event.preventDefault();
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        const lineNumber = e.target.position.lineNumber;
        addBreakpoint({ fileId: activeFile.id, line: lineNumber });
      }
    });
    return () => {
      mouseDown.dispose();
    };
  }, [activeFile]);

  // Open Files
  useEffect(() => {
    if (activeFile && editor.current) {
      const model = getModel(Storage, Storage.files[activeFile.id]);
      editor.current.setModel(model);

      const state = editorStats.current[activeFile.id];
      // is loaded and content may have changed
      if (state) {
        const { viewState } = state;
        editor.current.restoreViewState(viewState);
      } else {
        // Register change listener
        model.onDidChangeContent(() => {
          const { id, name } = Storage.files[activeFile.id];
          updateEditorFile({
            id: activeFile.id,
            dirty:
              editorStats.current[id].version !==
              model.getAlternativeVersionId()
          });
          runEslint(model);
        });
        editorStats.current[activeFile.id] = {
          version: model.getAlternativeVersionId()
        };
        editor.current.setModel(model);
      }

      runEslint(model);

      // Save the editor state before unloading
      return () => {
        editorStats.current[
          activeFile.id
        ].viewState = editor.current.saveViewState();
      };
    } else if (activeFile === undefined) {
      editor.current.setModel(null);
    }
  }, [editor, activeFile]);

  // Breakpoints
  // that will be transfered to the debugger
  // if connected
  useEffect(() => {
    if (!breakpoints) return;

    const oldDecorations = editor.current.deltaDecorations(
      [],
      breakpoints
        .filter(breakpoint => breakpoint && breakpoint.fileId === activeFile.id)
        .map(breakpoint => {
          if (breakpoint.active) {
            editor.current.revealLineInCenterIfOutsideViewport(breakpoint.line);
          }
          return {
            range: new monaco.Range(breakpoint.line, 1, breakpoint.line, 1),
            options: {
              isWholeLine: true,
              stickiness: 1,
              className: breakpoint.active && 'line-Breakpoint',
              linesDecorationsClassName: 'glyph-Breakpoint',
              glyphMarginHoverMessage: {
                value: breakpoint.message
              }
            }
          };
        })
    );
    return () => {
      editor.current.deltaDecorations(oldDecorations, []);
    };
  }, [activeFile, breakpoints.length]);

  // Apply activeBreakpoint
  /*
  useEffect(() => {
    if (!activeBreakPoint) return;

    const { line, message } = activeBreakPoint;

    editor.current.revealLineInCenterIfOutsideViewport(line);
    const oldDecorations = editor.current.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            stickiness: 1,
            className: 'line-Breakpoint',
            linesDecorationsClassName: 'glyph-Breakpoint',
            glyphMarginHoverMessage: {
              value: message
            }
          }
        }
      ]
    );
    return () => {
      editor.current.deltaDecorations(oldDecorations, []);
    };
  }, [editor, activeBreakPoint]);
  */

  useEffect(() => {
    if (!openSelection) return;
    let { selection } = openSelection;
    if (selection) {
      if (
        typeof selection.endLineNumber === 'number' &&
        typeof selection.endColumn === 'number'
      ) {
        editor.current.setSelection(selection);
        editor.current.revealRangeInCenter(selection, 1 /* Immediate */);
      } else {
        var pos = {
          lineNumber: selection.startLineNumber,
          column: selection.startColumn
        };
        editor.current.setPosition(pos);
        editor.current.revealPositionInCenter(pos, 1 /* Immediate */);
      }
    }
  }, [editor, openSelection]);

  return (
    <React.Fragment>
      <div
        ref={editorContainer}
        css={{
          width: '100%',
          height: '100%'
        }}
        style={{ display: activeFile ? 'block' : 'none' }}
      />
      {activeFile === undefined ? <WelcomeScreen /> : null}
    </React.Fragment>
  );
};

export default Editor;

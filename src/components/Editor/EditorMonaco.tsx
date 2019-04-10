/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useRef, useEffect, useState } from 'react';

import './style.css';

import WebIDELogo from '../Icons/WebIDELogo';

import monaco from './monaco';
import ESLint from '../../eslint/index';
import { useOvermind } from '../../overmind';

type EditorState = {
  [name: string]: {
    version?: number;
    model?: any;
    viewState?: any;
  };
};

const Button: React.FunctionComponent<{ onClick: VoidFunction }> = ({
  onClick,
  children
}) => {
  return (
    <div
      css={{
        cursor: 'pointer',
        padding: '.5em 0',
        color: '#2980b9',
        ':hover': { color: '#3498db' }
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const WelcomeScreen: React.FunctionComponent = () => {
  const {
    actions: { loadSampleData, openGist }
  } = useOvermind();
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%'
      }}
    >
      <WebIDELogo
        color={'rgba(0,0,0,0.2)'}
        css={{ marginBottom: '1em', height: '40%' }}
      />
      <span css={{ color: '#DDD', marginBottom: '1em' }}>
        Experiment with JavaScript for embedded devices.
      </span>
      <Button onClick={loadSampleData}>Load Example Data</Button>
      <Button onClick={openGist}>Load a GitHub Gist</Button>
    </div>
  );
};
const Editor: React.FunctionComponent = () => {
  const {
    actions: {
      Editor: { addModel, closeModel, updateFile }
    },
    state: {
      Editor: { activeFile, activeBreakPoint }
    }
  } = useOvermind();
  const [eslint, _] = useState<ESLint>(() => new ESLint());
  const editorStats = useRef<EditorState>({});
  const editorContainer = useRef(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>(null);

  const runEslint = model => {
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

    return () => {
      editor.current.dispose();
    };
  }, [editorContainer]);

  // Add Save Shortcut
  useEffect(() => {
    if (!activeFile) return;

    editor.current.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
      () => {
        const currentModel = editor.current.getModel();

        editorStats.current[
          activeFile.name
        ].version = currentModel.getAlternativeVersionId();

        updateFile({
          name: activeFile.name,
          content: currentModel.getValue(),
          dirty: false
        });
      }
    );
  }, [activeFile]);

  // Open Files
  useEffect(() => {
    if (activeFile && editor.current) {
      const { name } = activeFile;
      const state = editorStats.current[name];
      // is loaded and content is not changed
      if (state) {
        const { model, viewState } = state;
        editor.current.setModel(model);
        editor.current.restoreViewState(viewState);
        runEslint(model);
      } else {
        // Load new Model
        const model = monaco.editor.createModel(
          activeFile.content,
          'javascript'
        );
        addModel({
          name: activeFile.name,
          model
        });

        runEslint(model);

        // Register change listener
        model.onDidChangeContent(() => {
          const state = editorStats.current[activeFile.name];
          updateFile({
            name,
            dirty: state.version !== model.getAlternativeVersionId()
          });
          runEslint(model);
        });
        editorStats.current[name] = {
          model,
          version: model.getAlternativeVersionId()
        };
        editor.current.setModel(model);
      }
      return () => {
        const state = editorStats.current[name];
        monaco.editor.setModelMarkers(state.model, 'eslint', []);
        state.viewState = editor.current.saveViewState();
      };
    } else if (activeFile === undefined) {
      // Close
      editor.current.setModel(null);
    }
  }, [editor, activeFile]);

  // Apply activeBreakpoint
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
            stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
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
  return (
    <React.Fragment>
      <div
        ref={editorContainer}
        css={{ width: '100%', height: '100%' }}
        style={{ display: activeFile ? 'block' : 'none' }}
      />
      {activeFile === undefined ? <WelcomeScreen /> : null}
    </React.Fragment>
  );
};

export default Editor;

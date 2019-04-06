/** @jsx jsx */
import { jsx } from '@emotion/core';

import React, { useRef, useEffect, useState } from 'react';

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
    actions: { updateFile },
    state: {
      editor: { currentFile }
    }
  } = useOvermind();
  const [eslint, _] = useState<ESLint>(() => new ESLint());
  const editorStats = useRef<EditorState>({});
  const editorContainer = useRef(null);
  const editor = useRef(null);

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
      glyphMargin: true,
      theme: 'vs-dark',
      automaticLayout: true
    });

    return () => {
      editor.current.dispose();
    };
  }, [editorContainer]);

  // Add Save Shortcut
  useEffect(() => {
    editor.current.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
      () => {
        const currentModel = editor.current.getModel();

        editorStats.current[
          currentFile.name
        ].version = currentModel.getAlternativeVersionId();

        updateFile({
          name: currentFile.name,
          content: currentModel.getValue(),
          dirty: false
        });
      }
    );
  }, [currentFile]);

  // Open Files
  useEffect(() => {
    if (currentFile && editor.current) {
      const { name } = currentFile;
      const state = editorStats.current[name];
      // is loaded and content is not changed
      if (state && currentFile.content === state.model.getValue()) {
        const { model, viewState } = state;
        editor.current.setModel(model);
        editor.current.restoreViewState(viewState);
        runEslint(model);
      } else {
        // Dispose model
        if (state) {
          state.model = null;
        }
        // Load new Model
        const model = monaco.editor.createModel(
          currentFile.content,
          'javascript'
        );
        runEslint(model);

        // Register change listener
        model.onDidChangeContent(() => {
          const state = editorStats.current[currentFile.name];
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
    } else if (currentFile === undefined) {
      // Close
      editor.current.setModel();
    }
  }, [editor, currentFile]);

  return (
    <React.Fragment>
      <div
        ref={editorContainer}
        css={{ width: '100%', height: '100%' }}
        style={{ display: currentFile ? 'block' : 'none' }}
      />
      {currentFile === undefined ? <WelcomeScreen /> : null}
    </React.Fragment>
  );
};

export default Editor;

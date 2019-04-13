/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { useOvermind } from '../../overmind';

import WebIDELogo from '../Icons/WebIDELogo';
import { askImportGist } from '../../overmind/actions';

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
    actions: {
      Storage: { loadSampleData },
      askImportGist
    }
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
      <Button onClick={askImportGist}>Add files from GitHub Gist</Button>
    </div>
  );
};

export default WelcomeScreen;

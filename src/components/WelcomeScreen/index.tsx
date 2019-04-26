/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import { useOvermind } from '../../overmind';

import WebIDELogo from '../Icons/WebIDELogo';

const Button: React.FunctionComponent<{ onClick: VoidFunction }> = ({
  onClick,
  children
}) => {
  return (
    <div
      css={{
        cursor: 'pointer',
        padding: '.125em 0',
        color: '#2980b9',
        margin: '.125em .125em',
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
    state: {
      Storage: { project: currentProject }
    },
    actions: {
      Storage: { loadSampleData, openProject },
      askImportGist,
      askNewProject
    },
    effects: {
      Storage: { getProjectList }
    }
  } = useOvermind();

  const [projects, setProjects] = React.useState<string[]>();
  useEffect(() => {
    let unmounted = false;
    getProjectList().then(newProjects => {
      const projects = newProjects.filter(name => name !== currentProject);
      if (!unmounted) {
        setProjects(projects);
      }
    });
    return () => {
      unmounted = true;
    };
  }, [currentProject]);

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
      <div css={{ height: '30%' }}>
        <WebIDELogo color={'rgba(0,0,0,0.2)'} css={{ height: '100%' }} />
      </div>
      <span css={{ color: '#DDD', marginBottom: '.5em' }}>
        Experiment with JavaScript for embedded devices.
      </span>
      <section
        css={{
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        {projects && projects.length > 0 && (
          <section css={{ marginRight: '.5em' }}>
            <header>Open Project:</header>
            <section css={{ display: 'flex', flexDirection: 'column' }}>
              {projects.map(name => (
                <Button key={name} onClick={() => openProject(name)}>
                  {name}
                </Button>
              ))}
            </section>
          </section>
        )}
        <section>
          <header>Actions:</header>
          <Button onClick={askNewProject}>Create a new Project</Button>
          <Button onClick={() => loadSampleData('')}>Load example data</Button>
          <Button onClick={askImportGist}>Import GitHub Gist</Button>
        </section>
      </section>
    </div>
  );
};

export default WelcomeScreen;

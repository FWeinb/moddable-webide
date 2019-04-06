/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';
import { DeviceInstrumentConnectionState } from '../../overmind/state';

const AskToConnect: React.FC = () => {
  return <div>Currently Not Connected</div>;
};

const InstrumentationView: React.FC = () => {
  const {
    state: {
      device: { instruments, stats }
    }
  } = useOvermind();
  return (
    instruments &&
    stats && (
      <ul
        css={{
          listStyle: 'none',
          margin: 0,
          padding: '0 0.5em',
          fontSize: 12
        }}
      >
        {instruments.map((instrument, index) => {
          return (
            <li key={instrument.name} css={{ padding: 0, margin: 0 }}>
              <span>{instrument.name}: </span>
              <span>{stats[index]}</span>
              <span>{instrument.value}</span>
            </li>
          );
        })}
      </ul>
    )
  );
};

const SidebarDebug: React.FunctionComponent = () => {
  const {
    state: {
      device: { debugConnectionState }
    }
  } = useOvermind();

  return (
    <section
      role="Debug"
      css={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-dark)',
        height: '100%'
      }}
    >
      <header
        css={{
          margin: '0.5em 0',
          fontSize: '0.9rem',
          padding: '0 10px',
          textTransform: 'uppercase',
          color: '#6e7a82',
          paddingBottom: '0.25rem'
        }}
      >
        Debug
      </header>
      {debugConnectionState === DeviceInstrumentConnectionState.CONNECTED ? (
        <InstrumentationView />
      ) : (
        <AskToConnect />
      )}
    </section>
  );
};

export default SidebarDebug;

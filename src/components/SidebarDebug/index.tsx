/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';
import { DebugState } from '../../overmind/Device/state';
import Button from '../Button';

const AskToConnect: React.FC = () => {
  return <div>Currently Not Connected</div>;
};

const InstrumentationView: React.FC = () => {
  const {
    state: {
      Device: {
        debug: { instruments, samples }
      }
    }
  } = useOvermind();
  return (
    instruments &&
    samples && (
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
              <span>{samples[index]}</span>
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
      Device: {
        debug: { state }
      }
    },
    actions: {
      Device: { debugBreak, debugContinue }
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
      {state === DebugState.CONNECTED ? (
        <React.Fragment>
          <div>
            <Button
              css={{ fontSize: '1.5em', color: 'lime' }}
              onClick={() => {
                debugContinue();
              }}
            >
              ▶
            </Button>
            <Button
              css={{ fontSize: '1.5em', color: 'gray' }}
              onClick={() => {
                debugBreak();
              }}
            >
              ❙❙
            </Button>
          </div>
          <InstrumentationView />
        </React.Fragment>
      ) : (
        <AskToConnect />
      )}
    </section>
  );
};

export default SidebarDebug;

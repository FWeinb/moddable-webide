/** @jsx jsx */
import { jsx } from '@emotion/core';

import React from 'react';
import { useOvermind } from '../../overmind';

const InstrumentPanel: React.FunctionComponent = () => {
  const {
    state: {
      device: { instruments, stats }
    }
  } = useOvermind();
  return (
    instruments &&
    stats && (
      <React.Fragment>
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
          Instruments:
        </header>
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
      </React.Fragment>
    )
  );
};

export default InstrumentPanel;

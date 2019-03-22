/** @jsx jsx */
import { jsx } from '@emotion/core';

import React, { useEffect, useRef } from 'react';
import { useOvermind } from '../../overmind';

const Log: React.FunctionComponent = () => {
  const {
    state: {
      log: { messages }
    }
  } = useOvermind();

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  });

  return (
    <section
      css={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace'
      }}
      ref={scrollContainerRef}
    >
      <header
        css={{
          position: 'fixed',
          background: 'var(--color-background)',
          width: '100%',
          padding: '0.5em',
          color: '#DAD9DA'
        }}
      >
        Log
      </header>
      <section
        css={{
          padding: '2em .5em',
          marginTop: '1em',
          color: 'white',
          fontSize: '12px',
          lineHeight: '16px'
        }}
      >
        {messages.map(message => {
          return <div key={message.time}> {message.text}</div>;
        })}
      </section>
    </section>
  );
};

export default Log;
